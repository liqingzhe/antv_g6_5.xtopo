<template>
  <div class="edit">
    <el-container>
      <el-aside width="290px">
        <div class="top-title">拓扑图组件</div>
        <component-list />
      </el-aside>
      <el-main>
        <div class="top-bar">
          <el-button @click="downloadImg" type="primary">拓扑图下载</el-button>
          <el-button @click="clearCanvas" type="primary">清空画布</el-button>
          <el-button @click="saveCanvas" type="primary">保存</el-button>
        </div>
        <topo @bindDevice="showDeviceTree" type="edit" ref="topo" />
      </el-main>
    </el-container>
    <!-- <device-tree ref="deviceTree" /> -->
  </div>
</template> 
<script>
// import DeviceTree from "@/views/topo/components/DeviceTree.vue";
import ComponentList from "@/views/topo/components/ComponentList.vue"; // 左侧列表组件
import Topo from "@/views/topo/components/Topo.vue";

export default {
  name: "TopoEdit",
  components: {
    // DeviceTree,
    ComponentList,
    Topo,
  },
  computed: {},
  data() {
    return {};
  },
  async mounted() {},
  methods: {
    clearCanvas() {
      this.$confirm("确认清除画布？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        cancelButtonClass: "cancel-btn",
        confirmButtonClass: "confirm-btn",
        type: "warning",
      })
        .then(() => {})
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消",
          });
        });
    },
    saveCanvas() {},

    downloadImg() {},
    showDeviceTree() {},
  },
};
</script>
<style lang="scss" scoped>
.edit {
  height: 100%;
  .el-container {
    height: 100%;
    .el-aside {
      background-color: #182530;
      margin-right: 14px;
      background: url(~@/assets/images/common/border-bottom.png) no-repeat 100%
        bottom;
      .top-title {
        font-size: 16px;
        width: 290px;
        height: 35px;
        line-height: 35px;
        background-image: url(~@/assets/images/common/title.png);
        padding-left: 36px;
      }
    }
  }
  .el-main {
    padding: 0;
    .top-bar {
      height: 40px;
      text-align: right;
      height: 40px;
      line-height: 40px;
      background-image: linear-gradient(
        90deg,
        #144b55 0%,
        rgba(20, 75, 85, 0.6) 30%,
        rgba(20, 75, 85, 0.4) 100%
      );
      .el-button {
        margin-right: 10px;
      }
    }
  }
}
</style>

