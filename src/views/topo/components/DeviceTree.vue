<template>
    <el-drawer
        :title="title"
        :visible.sync="dialogVisible"
        :size="400"
        :before-close="handleClose"
        :wrapperClosable="false"
    >
        <el-input
            placeholder="请输入名称或IP"
            v-model="searchParams"
            clearable
            @clear="search"
            @keyup.enter.native="search"
        >
            <i
                slot="suffix"
                class="el-input__icon el-icon-search"
                @click="search"
            ></i>
        </el-input>
        <my-table
            :isShowSelection="true"
            :isShowOperate="false"
            :is-radio="isRadio"
            :isShowPagination="false"
            :table-data="tableData"
            @sort="sort"
            @selectionChange="selectionChange"
            :table-configuration="tableConfiguration"
            ref="mytable"
        ></my-table>
        <div class="footer">
            <el-button type="primary" class="cancel-btn" @click="handleClose"
                >取消</el-button
            >
            <el-button type="primary" class="confirm-btn" @click="onSubmit">
                <span v-if="type == 'bindDevice'">确定</span>
                <span v-else-if="type == 'bindLinkDevice'">自动生成拓扑图</span>
            </el-button>
        </div>
    </el-drawer>
</template>
<script>
import MyTable from "@/components/Table.vue";
import { autoTopologyInfoByDeviceId } from "@/api/topo";
import { getMonitorDevInfo } from "@/api/monitor";
import eventBus from "@/utils/eventBus";

export default {
    props: {},
    components: { MyTable },
    data() {
        return {
            title: "绑定设备",
            dialogVisible: false,
            tableConfiguration: [
                { label: "名称", prop: "name" },
                { label: "IP", prop: "deviceIp" },
            ],
            tableData: [],
            selectData: [],
            isRadio: false,
            type: "bindDevice",
            sortType: "", // 排序方式
            searchParams: "",
            node: {}, // 当前node
        };
    },
    watch: {},
    created() {},
    mounted() {},
    computed: {},
    methods: {
        async show({ text, type, node }) {
            this.dialogVisible = true;
            this.title = text;
            this.type = type;
            this.node = node;
            if (type == "bindDevice") {
                // 绑定设备
                this.isRadio = true; // 只能选择一项为设备绑定信息
                await this.getTableData();
                this.$nextTick(() => {
                    this.$refs.mytable.$refs.table.clearSelection();
                    node.deviceId &&
                        this.$refs.mytable.$refs.table.toggleRowSelection(
                            this.tableData.find((item) => {
                                return item.deviceId == node.deviceId;
                            }),
                            true
                        );
                });
            } else if (type == "bindLinkDevice") {
                // 绑定关联设备
                this.isRadio = false;
                await this.getTableData(node.deviceId);
                this.$nextTick(() => {
                    if (node.children && node.children.length) {
                        this.$refs.mytable.$refs.table.clearSelection();
                        let selectData = [];
                        this.tableData.forEach((row) => { // 回显已绑定的设备
                            node.children.forEach((item) => {
                                if (row.deviceId == item.deviceId) {
                                    selectData.push(row);
                                }
                            });
                        });
                        selectData.forEach((row) => {
                            this.$refs.mytable.$refs.table.toggleRowSelection(
                                row,
                                true
                            );
                        });
                    } else {
                        this.$refs.mytable.$refs.table.toggleAllSelection();
                    }
                });
            }
        },
        handleClose() {
            this.dialogVisible = false;
        },
        selectionChange(val) {
            !this.searchParams && (this.selectData = val); // 仅在无搜索值时候进行赋值
        },
        search() {
            this.sort({ order: this.sortType });
        },
        async sort({ order }) {
            let selectData = this.selectData;
            this.sortType =
                order == "ascending" ? 0 : order == "descending" ? 1 : "";
            await this.getTableData();
            this.$nextTick(() => {
                selectData &&
                    selectData.forEach((row) => {
                        this.$refs.mytable.$refs.table.toggleRowSelection(
                            this.tableData.find((item) => {
                                return row.deviceId == item.deviceId;
                            }),
                            true
                        );
                    });
            });
        },
        async getTableData() {
            if (this.type == "bindDevice") {
                let res = await getMonitorDevInfo({
                    monitorType: 2,
                    sortType: this.sortType,
                    param: this.searchParams,
                });
                this.tableData = res.data.list.map((item) => {
                    return {
                        name: item.deviceName,
                        deviceIp: item.ipAddress,
                        deviceId: item.deviceId,
                        deviceType: item.deviceType,
                        nodeType: "Switch",
                        deviceInfo: item,
                    };
                });
            } else if (this.type == "bindLinkDevice") {
                let res = await autoTopologyInfoByDeviceId({
                    deviceId: this.node.deviceId,
                    // ortKey: 'ip', // 排序字段
                    isDes: this.sortType == 1 ? true : false, // 是否逆序
                    searchKey: this.searchParams,
                });
                this.tableData = res.data.map((item) => {
                    let nodeTypeList = [
                        "",
                        "Server",
                        "NetWork",
                        "Collect",
                        "Export",
                    ];
                    return {
                        name: item.deviceName,
                        deviceIp: item.deviceIp,
                        deviceId: item.deviceId,
                        deviceType: item.deviceType,
                        nodeType: nodeTypeList[Number(item.deviceType)],
                        deviceInfo: item,
                    };
                });
            }
        },
        onSubmit() {
            if (!this.selectData.length) {
                this.$message.warning("请先选择设备");
                return;
            }
            eventBus.$emit("setBindData", {
                data: this.selectData,
                type: this.type,
            });
            this.dialogVisible = false;
        },
    },
};
</script>
<style scoped lang="scss">
/deep/.el-drawer {
    .el-input__inner,
    .el-input {
        width: 358px;
        margin-bottom: 14px;
    }
    .wrap {
        height: auto;
    }
}

.tree-list .item {
    width: 100%;
    font-size: 12px;
    line-height: 30px;
    display: block;
    border-bottom: 1px solid #eee;
}
</style>