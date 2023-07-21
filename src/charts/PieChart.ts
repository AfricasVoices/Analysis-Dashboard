import { EChartsType } from "echarts/core";
import { DatasetAnalysis } from "../database/files/ThemeDistributions";
import * as echarts from "echarts/core";
import { EChartsOption } from "echarts";
import { SVGRenderer } from "echarts/renderers";
import { DatasetComponent, TitleComponent } from "echarts/components";
import { PieChart as EChartsPieChart } from "echarts/charts";
import AVF_COLOR_SCALE from "./avf_color_scale";

export default class PieChart {
    private chart: EChartsType;

    constructor(private container: HTMLElement, private data: DatasetAnalysis) {
        echarts.use([SVGRenderer, DatasetComponent, TitleComponent, EChartsPieChart]);

        this.chart = echarts.init(this.container, undefined, {
            // TODO: Set size, and resize, dynamically
            width: 320,
            height: 200,
            renderer: "svg",
        });

        this.updateData(data);
    }

    updateData(data: DatasetAnalysis): void {
        this.data = data;

        const option: EChartsOption = {
            title: {
                text: data.episodeId,
                left: "center",
                top: "5%",
                textStyle: {
                    fontSize: 14
                }
            },
            dataset: {
                source: data.normalThemeDistributions().map((t) => ({
                    name: t.displayText,
                    value: t.totalConsentingParticipants,
                })),
            },
            color: AVF_COLOR_SCALE,
            series: [
                {
                    type: "pie",
                    label: {
                        formatter: "{b} ({d}%)", // displayText (percent)
                        overflow: "break",
                    },
                    radius: "50%",
                    percentPrecision: 1,
                },
            ],
        };

        this.chart.setOption(option);
    }
}
