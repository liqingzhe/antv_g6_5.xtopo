<!-- App.vue -->
<template>
  <div id="app">
    <el-container>
      <el-header height="60px">
        <div class="app-header">
          <h1>G6 4.x 流程图编辑器</h1>
          <el-button type="text" @click="exportData">导出数据</el-button>
        </div>
      </el-header>
      
      <el-main>
        <GraphEditor ref="graphEditor" />
      </el-main>
      
      <el-footer height="40px">
        <div class="app-footer">
          <span>基于 G6 {{ g6Version }} 构建</span>
          <el-link type="primary" href="https://g6.antv.vision/" target="_blank">
            查看 G6 文档
          </el-link>
        </div>
      </el-footer>
    </el-container>
  </div>
</template>

<script>
import GraphEditor from './components/GraphEditor.vue';
import G6 from '@antv/g6';

export default {
  name: 'App',
  components: {
    GraphEditor
  },
  data() {
    return {
      g6Version: G6.version || '4.x'
    };
  },
  methods: {
    exportData() {
      const data = this.$refs.graphEditor.graphData;
      const dataStr = JSON.stringify(data, null, 2);
      
      // 创建下载链接
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'graph-data.json';
      a.click();
      URL.revokeObjectURL(url);
      
      this.$message.success('数据导出成功');
    }
  }
};
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 20px;
  border-bottom: 1px solid #e6e6e6;
}

.app-header h1 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.app-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 20px;
  border-top: 1px solid #e6e6e6;
  color: #666;
  font-size: 14px;
}
</style>