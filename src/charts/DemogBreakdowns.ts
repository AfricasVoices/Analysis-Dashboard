import { EChartsType } from "echarts/core";
import { DatasetAnalysis } from "../database/files/ThemeDistributions";
import * as echarts from "echarts/core";
import { EChartsOption } from "echarts";
import { SVGRenderer } from "echarts/renderers";
import { DatasetComponent } from "echarts/components";
import { PieChart as EChartsPieChart } from "echarts/charts";
import AVF_COLOR_SCALE from "./avf_color_scale";

export default class DemogBreakdowns {
    private chart: EChartsType;

    constructor(
        private container: HTMLElement,
        private data: DatasetAnalysis[]
    ) {
        echarts.use([SVGRenderer, DatasetComponent, EChartsPieChart]);

        this.chart = echarts.init(this.container, undefined, {
            // TODO: Set size, and resize, dynamically
            width: 550,
            height: 400,
            renderer: "svg",
        });

        this.updateData(data);
    }

    updateData(data: DatasetAnalysis[]): void {
        this.data = data;

        const dataset = data.map((d) =>
            ({
                source: d.normalThemeDistributions().map((t) =>
                        ({
                            name: t.displayText,
                            value: t.totalConsentingParticipants,
                        })
                    )
            })
        )

        console.log(dataset);

        const option: EChartsOption = {
            dataset: dataset,

            color: AVF_COLOR_SCALE,
            series: [
                {
                    name: "Gender",
                    type: "pie",
                    label: {
                        formatter: "{b} ({d}%)", // displayText (percent)
                        overflow: "break",
                    },
                    percentPrecision: 1,
                },
                {
                    name: "Gender",
                    type: "pie",
                    label: {
                        formatter: "{b} ({d}%)", // displayText (percent)
                        overflow: "break",
                    },
                    percentPrecision: 1,
                },
            ],
        };

        this.chart.setOption(option);
    }
}
