<template>
    <div class="detail">
        <topo
            ref="topo"
            type="detail"
            @nodeHover="nodeHover"
            @nodeMouseOut="nodeMouseOut"
            @linkHover="linkHover"
            @initReady="drawStage"
        />
        <device-info
            v-if="isShowInfo"
            ref="deviceInfo"
            :style="'top:' + position.top + 'px;left:' + position.left + 'px'"
            :info="deviceInfo"
        />
        <!-- <div class="operate">
            <span>
                设备名称
                <el-switch v-model="operate.nameSwitch" active-color="#7bfffb">
                </el-switch>
            </span>
            <span>
                IP地址
                <el-switch v-model="operate.ipSwitch" active-color="#7bfffb">
                </el-switch>
            </span>
        </div> -->
    </div>
</template> 
<script>
import Topo from "./Topo.vue";
import DeviceInfo from "./DeviceInfo.vue";
import { getTopoData } from "@/api/topo.js";
import { mapState } from "vuex";

export default {
    name: "TopoDetail",
    components: {
        Topo,
        DeviceInfo,
    },
    computed: {
        ...mapState({
            curTab: (state) => state.topo.curTab,
        }),
    },
    data() {
        return {
            operate: {
                nameSwitch: true,
                ipSwitch: true,
            },
            position: {
                top: 0,
                left: 0,
            },
            isShowInfo: false,
            deviceInfo: {},
        };
    },
    watch: {
        "operate.nameSwitch"(value) {
            if (value) {
                this.$refs.topo.showNodeText("deviceName");
            } else {
                this.$refs.topo.hideNodeText("deviceName");
            }
        },
        "operate.ipSwitch"(value) {
            if (value) {
                this.$refs.topo.showNodeText("deviceIp");
            } else {
                this.$refs.topo.hideNodeText("deviceIp");
            }
        },
    },
    mounted() {
        this.drawStage();
    },
    methods: {
        async getCanvasData() {
            const id = this.curTab.split("-")[1];
            let { data } = await getTopoData({ topologyId: id });
            return data;
        },
        async drawStage() {
            let data = await this.getCanvasData();
            this.$refs.topo.createStageFromJson(data);
        },
        nodeHover({ e, node }) {
            if (!node.deviceId) {
                if (node.nodeType == "Switch") {
                    this.$message.warning("未绑定设备，暂无法查看详情");
                }
                return;
            }
            this.isShowInfo = true;
            this.$nextTick(() => {
                let canvasWidth = this.$refs.topo.$el.clientWidth;
                let canvasHeight = this.$refs.topo.$el.clientHeight;
                let width = this.$refs.deviceInfo.$el.clientWidth;
                let height = this.$refs.deviceInfo.$el.clientHeight;
                this.position.left =
                    e.offsetX + width > canvasWidth
                        ? e.offsetX - width - node.width
                        : e.offsetX + node.width / 2;
                this.position.top =
                    e.offsetY + height > canvasHeight
                        ? canvasHeight - height - 20
                        : e.offsetY - height / 2;

                this.position.top <= 10 && (this.position.top = 10);
                this.position.left <= 10 && (this.position.left = 10);
            });
            this.deviceInfo = {
                deviceId: node.deviceId,
                deviceType: node.deviceType,
            };

            this.$set(node, "showSelected", false);
            console.log(e);
        },
        nodeMouseOut({ node }) {
            this.$set(node, "showSelected", false);
            this.isShowInfo = false;
        },
        linkHover({ link }) {
            this.$set(link, "showSelected", false);
        },
    },
};
</script>
<style lang="scss" scoped>
.detail {
    height: 100%;
    position: relative;
    .el-row {
        height: 100%;
    }
    /deep/ .center {
        height: 100%;
    }
    .operate {
        position: absolute;
        right: 20px;
        top: 20px;
        z-index: 999;
        span {
            margin-right: 40px;
        }
    }
}
</style>

