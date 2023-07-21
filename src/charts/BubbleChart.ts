import {
    DatasetAnalysis,
    ThemeAnalysis,
} from "../database/files/ThemeDistributions";
import * as echarts from "echarts/core";
import {
    hierarchy,
    HierarchyCircularNode,
    HierarchyNode,
    pack,
} from "d3-hierarchy";
import { SVGRenderer } from "echarts/renderers";
import {
    DatasetComponent,
    ToolboxComponent,
    TooltipComponent,
    VisualMapComponent,
} from "echarts/components";
import { CustomChart } from "echarts/charts";
import {
    CustomSeriesRenderItemAPI,
    CustomSeriesRenderItemParams,
    CustomSeriesRenderItemReturn,
    EChartsOption,
} from "echarts";
import { getRepeatingAVFColorScale } from "./avf_color_scale";
import { CallbackDataParams } from "echarts/types/src/util/types";
import { EChartsType } from "echarts/core";
import { measureTextWidth } from "./chart_utils";

function trimCircleInnerText(text: string, circleRadius: number): string {
    /**
     * @param text:
     * @param circleRadius:
     */
    // TODO: Replace these heuristics with measurements on the actual text contents
    //       to ensure guaranteed fit.
    if (circleRadius < 15) {
        return "";
    } else if (circleRadius < 35) {
        return " " + text.split(" ")[0];
    } else {
        return text;
    }
}

type LayoutDatum = {
    name: string;
    x: number;
    y: number;
    r: number;
    displayText: string;
    totalConsentingParticipants: number;
};

export default class BubbleChart {
    private chart: EChartsType;

    constructor(
        private container: HTMLElement,
        private data: DatasetAnalysis,
        private voices: any
    ) {
        echarts.use([
            SVGRenderer,
            ToolboxComponent,
            TooltipComponent,
            VisualMapComponent,
            DatasetComponent,
            CustomChart,
        ]);

        this.chart = echarts.init(this.container, undefined, {
            // TODO: Set size, and resize, dynamically
            width: 550,
            height: 400,
            renderer: "svg",
        });

        this.updateData(data, voices);
    }

    private computeLayoutData(data: ThemeAnalysis[]): LayoutDatum[] {
        const sortedData: ThemeAnalysis[] = data
            // Sort the themes in descending order of the number of participants labelled with each theme
            .sort(
                (a: ThemeAnalysis, b: ThemeAnalysis) =>
                    b.totalConsentingParticipants -
                    a.totalConsentingParticipants
            )
            // Record each theme's position in the sorted array, for formatting.
            .map((d, i) => ({
                ...d,
                displayText: `${i + 1}. ${d.displayText}`,
            }));

        // Use d3-hierarchy to circle-pack the data into the available chart space.
        // Note that d3-hierarchy expects a hierarchy of nodes, so we need to create a root node with
        // all the ThemeAnalysis data as children.
        type Root = { children: ThemeAnalysis[] };
        const toPack: HierarchyNode<Root | ThemeAnalysis> = hierarchy<
            Root | ThemeAnalysis
        >({ children: sortedData });

        const packed: HierarchyCircularNode<Root | ThemeAnalysis> = pack<
            Root | ThemeAnalysis
        >()
            .size([350, 400])
            .padding(4)(
            toPack.sum((d) => (d as ThemeAnalysis).totalConsentingParticipants)
        );

        // Fetch the packed circles from underneath the root node, and convert each to a LayoutDatum
        return (packed.children as HierarchyCircularNode<ThemeAnalysis>[]).map(
            (d) => ({
                name: d.data.displayText,
                x: d.x,
                y: d.y,
                r: d.r,
                displayText: d.data.displayText,
                totalConsentingParticipants: d.data.totalConsentingParticipants,
            })
        );
    }

    /**
     * Creates the echarts custom object configuration for a single bubble.
     */
    private renderBubble(
        _: CustomSeriesRenderItemParams,
        api: CustomSeriesRenderItemAPI
    ): CustomSeriesRenderItemReturn {
        const x = api.value("x") as number;
        const y = api.value("y") as number;
        const r = api.value("r") as number;
        const displayText = api.value("displayText") as string;

        return {
            type: "circle",
            shape: {
                cx: x,
                cy: y,
                r: r,
            },
            style: {
                fill: api.visual("color") as string,
            },
            textConfig: {
                position: "inside",
            },
            textContent: {
                type: "text",
                style: {
                    width: r * 1.9,
                    text: trimCircleInnerText(displayText, r),
                    overflow: "break",
                },
            },
            emphasis: {
                style: {
                    stroke: "#111",
                    lineWidth: 1,
                },
            },
        };
    }

    private getTooltipHTML(
        theme: ThemeAnalysis,
        dataset: DatasetAnalysis,
        color: string
    ): string {
        const displayText = theme.displayText;
        const themeParticipants = theme.totalConsentingParticipants;
        const datasetParticipants = dataset.totalRelevantParticipants;

        const participantsText =
            themeParticipants === 1 ? "participant" : "participants";

        const participantsPercentageStr = (
            themeParticipants / datasetParticipants
        ).toLocaleString(undefined, {
            style: "percent",
            minimumFractionDigits: 1,
        });

        return `
            <div style="text-align: center">
                <b>${displayText}:</b> ${themeParticipants} ${participantsText} (${participantsPercentageStr})
            </div>`;
    }

    updateData(data: DatasetAnalysis, voices: any): void {
        this.data = data;
        voices = voices
            .map((v: any) => {
                let infoText = [v.gender, v.age, v.district]
                    .filter((x) => x != null)
                    .join(", ");
                return { ...v, infoText };
            })
            .slice(50);
        this.voices = voices;

        const layoutData: LayoutDatum[] = this.computeLayoutData(
            this.data.normalThemeDistributions()
        );

        const option: EChartsOption = {
            toolbox: {
                feature: {
                    saveAsImage: {},
                },
            },
            tooltip: {
                formatter: (
                    params: CallbackDataParams | CallbackDataParams[]
                ): string => {
                    // @ts-ignore because params.data is guaranteed to be of type LayoutParams for this dataset
                    return this.getTooltipHTML(params.data, data, params.color);
                },
                // confine: true
            },
            dataset: {
                source: layoutData,
            },
            // @ts-ignore because visualMap.dimension is incorrectly typed in echarts as number only, even though
            // it supports strings too.
            visualMap: {
                type: "piecewise",
                categories: layoutData.map((d) => d.displayText),
                inRange: {
                    color: getRepeatingAVFColorScale(layoutData.length),
                },
                formatter: (t: string): string => {
                    const font = "normal normal 12px sans-serif";
                    if (measureTextWidth(t, font) < 150) {
                        return t;
                    } else {
                        const tokens = t.split(" ");
                        let lines: string[] = [];
                        let currentLine = "";
                        tokens.forEach((tok) => {
                            if (
                                measureTextWidth(currentLine + tok, font) < 150
                            ) {
                                currentLine += tok + " ";
                            } else {
                                lines.push(currentLine);
                                currentLine = tok + " ";
                            }
                        });
                        lines.push(currentLine);
                        return lines.join("\n");
                    }
                },
                dimension: "displayText",
                itemGap: 2,
                selectedMode: false,
                text: ["Themes", ""],
                showLabel: true,
                left: "right",
                top: "middle",
                align: "left",
                textStyle: {
                    fontSize: 12,
                    fontFamily: "sans-serif",
                    fontWeight: "normal",
                    fontStyle: "normal",
                },
            },
            series: {
                name: "Theme Distributions",
                type: "custom",
                coordinateSystem: "none",
                renderItem: this.renderBubble,
            },
        };

        this.chart.setOption(option);
    }
}
