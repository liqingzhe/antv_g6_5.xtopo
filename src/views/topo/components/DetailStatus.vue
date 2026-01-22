<template>
    <div class="system-status">
        <el-row class="list">
            <el-col v-for="(item, key) in listOptions" :key="key">
                <div class="title">{{ mapLabel[key] }}</div>
                <echarts
                    class="echarts"
                    :width="width"
                    :height="height"
                    :option="item.option"
                ></echarts>
                <div class="info" v-if="key != 'cpuUseRate'">
                    <div>
                        已用
                        <span class="num">{{ item.moreInfo.used }} G</span>
                    </div>
                    <div>
                        总共
                        <span class="num">{{ item.moreInfo.total }} G</span>
                    </div>
                </div>
            </el-col>
        </el-row>
    </div>
</template>
<script>
import Echarts from "@/components/echarts/Echarts.vue";
import { deepClone } from "@/utils/index.js";
import { getMetricInfo } from "@/api/monitor";
const NORMALCOLOR = "#4cff8b";
const MEDIUMCOLOR = "#f8ff41";
const WARNIGNCOLOR = "#ff4646";
export default {
    props: {
        width: {
            type: String,
            default: "100%",
        },
        height: {
            type: String,
            default: "80%",
        },
        deviceId: {
            type: String,
            default: "",
        },
        isShowOther: {
            type: Boolean,
            default: true,
        },
    },
    components: {
        Echarts,
    },
    data() {
        return {
            timer: null,
            intervalTime: 5000, // 轮询间隔 5s
            //指标信息
            metrics: ["cpuUseRate", "memoryUseRate"],
            otherMetrics: ["cpuTemperature", "fanSpeed"],
            otherMetricsList: {
                cpuTemperature: {
                    label: "CPU温度",
                    value: "",
                },
                zb: {
                    label: "主板温度",
                    value: "",
                },
                fanSpeed: {
                    label: "风扇转速",
                    value: "",
                },
            },
            mapLabel: {
                cpuUseRate: "CPU使用率",
                memoryUseRate: "内存使用率",
            },

            listOptions: {},
            option: {
                title: {
                    text: "",
                    textStyle: {
                        color: "#fff",
                        fontSize: 16,
                        fontWeight: "normal",
                    },
                    top: 10,
                    left: "center",
                },
                series: [
                    {
                        type: "gauge",
                        startAngle: 90,
                        endAngle: -270,
                        min: 0,
                        max: 100,
                        radius: "68%",
                        center: ["33%", "60%"],
                        progress: {
                            show: true,
                            width: 6,
                        },
                        pointer: {
                            show: false,
                        },
                        anchor: {
                            // 指针固定点
                            show: false,
                        },
                        axisLabel: {
                            // 刻度盘上的标识
                            show: false,
                        },
                        axisLine: {
                            show: false,
                        },
                        axisTick: {
                            // 小的刻度间隔
                            show: false,
                        },
                        splitLine: {
                            // 大间隔
                            show: false,
                        },
                        title: {
                            // detail的标题内容-完成率
                            show: false,
                            offsetCenter: [0, "-40%"],
                            fontSize: 14,
                        },
                        detail: {
                            valueAnimation: true,
                            fontSize: 20,
                            color: "#fff",
                            offsetCenter: [0, 0],
                            formatter: (value) => {
                                return value + "%";
                            },
                        },
                        data: [
                            {
                                value: "",
                                name: "",
                            },
                        ],
                    },
                    {
                        //内层圆环
                        type: "gauge",
                        startAngle: 90,
                        endAngle: -270,
                        min: 0,
                        max: 100,
                        radius: "55%",
                        center: ["33%", "60%"],
                        pointer: {
                            show: false,
                        },
                        anchor: {
                            // 指针固定点
                            show: false,
                        },
                        axisLabel: {
                            // 刻度盘上的标识
                            show: false,
                        },
                        axisLine: {
                            show: true,
                            lineStyle: {
                                width: 1,
                                color: [[1, "#4cff8b"]],
                                opacity: 0.5,
                            },
                        },
                        axisTick: {
                            // 小的刻度间隔
                            show: false,
                        },
                        splitLine: {
                            // 大间隔
                            show: false,
                        },
                    },
                    {
                        // 外层圆环
                        type: "gauge",
                        startAngle: 90,
                        endAngle: -270,
                        min: 0,
                        max: 100,
                        radius: "63%",
                        center: ["33%", "60%"],
                        pointer: {
                            show: false,
                        },
                        anchor: {
                            // 指针固定点
                            show: false,
                        },
                        axisLabel: {
                            // 刻度盘上的标识
                            show: false,
                        },
                        axisLine: {
                            show: true,
                            lineStyle: {
                                width: 3,
                                color: [[1, "#4cff8b"]],
                                opacity: 0.5,
                            },
                        },
                        axisTick: {
                            // 小的刻度间隔
                            show: false,
                        },
                        splitLine: {
                            // 大间隔
                            show: false,
                        },
                    },
                ],
            },
        };
    },
    watch: {
        deviceId: {
            handler(value) {
                this.timer && clearInterval(this.timer);
                if (!value) return;
                this.getDevMetricInfo(this.deviceId);

                this.timer = setInterval(() => {
                    this.getDevMetricInfo(value);
                }, this.intervalTime);
            },
            immediate: true,
        },
    },
    created() {},
    mounted() {},
    methods: {
        getDevMetricInfo(deviceId) {
            let params = {
                deviceIds: [deviceId],
                metrics: [
                    ...this.metrics,
                    "memTotal",
                    "memUsed",
                    "diskTotal",
                    "diskUsed",
                ],
            };
            getMetricInfo(params).then(({ data }) => {
                let metric = data[0] ? data[0].metric : {};
                this.setOptions(metric);
            });
        },
        setOptions(data) {
            // 设置配置值
            this.metrics.forEach((key) => {
                let option = deepClone(this.option);
                let value = data[key] ? Math.round(data[key] * 100) : 0;
                option.series[0].data[0].value = value;
                // option.title.text = this.mapLabel[key];
                if (value <= 50 && value >= 0) {
                    option.series[0].color = NORMALCOLOR;
                    option.series[1].axisLine.lineStyle.color = [
                        [1, NORMALCOLOR],
                    ];
                    option.series[2].axisLine.lineStyle.color = [
                        [1, NORMALCOLOR],
                    ];
                } else if (value > 80 && value < 100) {
                    option.series[0].color = WARNIGNCOLOR;
                    option.series[1].axisLine.lineStyle.color = [
                        [1, WARNIGNCOLOR],
                    ];
                    option.series[2].axisLine.lineStyle.color = [
                        [1, WARNIGNCOLOR],
                    ];
                } else {
                    option.series[0].color = MEDIUMCOLOR;
                    option.series[1].axisLine.lineStyle.color = [
                        [1, MEDIUMCOLOR],
                    ];
                    option.series[2].axisLine.lineStyle.color = [
                        [1, MEDIUMCOLOR],
                    ];
                }
                let moreInfo = {};
                if (key == "cpuUseRate") {
                    option.series.forEach((item) => {
                        item.center = ["50%", "60%"];
                    });
                } else if (key == "memoryUseRate") {
                    moreInfo = {
                        total: data.memTotal
                            ? Number(data.memTotal).toFixed(2)
                            : "",
                        used: data.memUsed
                            ? Number(data.memUsed).toFixed(2)
                            : "",
                    };
                }
                this.$set(this.listOptions, key, { option, moreInfo });
            });
        },
    },
    destroyed() {
        clearInterval(this.timer);
    },
};
</script>
<style scoped lang="scss">
.system-status {
    .list {
        width: 100%;
        overflow: hidden;
        .title {
            font-size: 16px;
            line-height: 46px;
            color: #bed8de;
            border-bottom: 1px solid #35434c;
        }
        .el-col {
            width: 420px;
            height: 240px;
            padding: 0 20px;
            background-color: #0c171e;
            border: solid 1px #35434c;
            position: relative;
            background-color: #0c171e;
            border: solid 1px #35434c;
            float: left;
            &:first-child {
                margin-right: 18px;
            }
            .info {
                position: absolute;
                right: 17%;
                top: 50%;
                font-size: 14px;
                line-height: 20px;
                .num {
                    color: $activeColor;
                }
            }
            .echarts {
                margin-top: -15px;
            }
           
        }
    }
}
</style>