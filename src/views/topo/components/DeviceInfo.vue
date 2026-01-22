<template>
    <div class="device-info">
        <div class="title">设备信息</div>
        <div class="detail">
            <h3><i class="icon icon-info"></i>基础信息</h3>
            <ul class="info">
                <li class="item" v-for="(item, key) in mapLabel" :key="key">
                    <span class="label">{{ item.label }}：</span>
                    {{ deviceInfo[key] }}
                </li>
            </ul>
        </div>
        <div class="info-panel">
            <DetailStatus
                :device-id="deviceInfo.deviceId"
                :is-show-other="false"
            ></DetailStatus>
        </div>
    </div>
</template>
<script>
import { getDeviceStaticInfoById } from "@/api/monitor";
import DetailStatus from "./DetailStatus.vue";

export default {
    props: {
        info: {
            type: Object,
            default: () => {},
        },
    },
    components: { DetailStatus },
    data() {
        return {
            dialogVisible: false,
            deviceInfo: {},
            mapLabel: {
                deviceName: {
                    label: "设备名称",
                },
                deviceTypeName: {
                    label: "设备类型",
                },
                deviceIP: {
                    label: "设备IP",
                },
                upTime: {
                    label: "运行时长",
                },
                osInfo: {
                    label: "操作系统",
                },
                // pz: {
                //     label: "配置"
                // },
                modeInfo: {
                    label: "服务器型号",
                },
                cpuInfo: {
                    label: "CPU",
                },
                displayCard: {
                    label: "显卡",
                },
                memInfo: {
                    label: "内存",
                },

                diskCard: {
                    label: "硬盘",
                },
                // zb: {
                //     label: "主板"
                // },
                netCard: {
                    label: "网卡",
                },
            },
        };
    },
    watch: {
        info: {
            handler(value) {
                console.log(value);
                this.getDeviceInfo(value);
            },
            deep: true,
            immediate: true,
        },
    },
    methods: {
        handleClose() {
            this.dialogVisible = false;
        },
        getDeviceInfo(info) {
            let params = {
                deviceId: info.deviceId,
                deviceType: info.deviceType,
            };
            getDeviceStaticInfoById(params).then(({ data }) => {
                this.deviceInfo = { ...this.info, ...data };
            });
        },
    },
};
</script>
<style lang="scss" scoped>
.device-info {
    position: absolute;
    z-index: 99999;
    width: 900px;
    height: 600px;
    padding: 13px 20px;
    background-color: #0f232f;
    border: 1px solid #7bfffb;
    .title {
        font-size: 18px;
        color: #fff;
        &::before {
            display: inline-block;
            content: "";
            width: 3px;
            height: 16px;
            margin: 0 5px;
            vertical-align: -2px;
            background-image: linear-gradient(0deg, #7bfffb 0%, #0c171e 100%);
        }
    }
    .detail {
        background-color: #0c171e;
        border: solid 1px #35434c;
        margin: 18px 0 20px;
        padding: 5px 20px;
        h3 {
            font-size: 16px;
            line-height: 46px;
            color: #bed8de;
            border-bottom: 1px solid #35434c;
        }
        .info {
            padding: 20px 10px 10px;
            overflow: hidden;
            li {
                font-size: 14px;
                color: $fontColor;
                width: 33.333%;
                float: left;
                margin-bottom: 3%;
                .label {
                    display: inline-block;
                    // width: 80px;
                    // text-align: right;
                    margin-right: 10px;
                }
            }
        }
    }
}
</style>
