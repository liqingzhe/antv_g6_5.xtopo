<template>
  <div class="topology-system">
    <!-- 工具栏 -->
    <div class="toolbar">
      <button @click="addNode">添加节点</button>
      <button @click="removeNode">删除节点</button>
      <button @click="zoomIn">放大</button>
      <button @click="zoomOut">缩小</button>
      <button @click="fitView">适应画布</button>
      <button @click="clear">清空</button>
    </div>

    <!-- 图表容器 -->
    <div ref="container" class="graph-container"></div>

    <!-- 信息面板 -->
    <div v-if="selectedNode" class="info-panel">
      <h3>节点信息</h3>
      <div class="info-content">
        <p>ID: {{ selectedNode.id }}</p>
        <p>类型: {{ selectedNode.data?.type || "未知" }}</p>
        <p>状态: {{ selectedNode.data?.status || "正常" }}</p>
      </div>
    </div>
  </div>
</template>

<script>
// 导入 G6 5.x
import { Graph } from "@antv/g6";

export default {
  name: "TopologySystem",
  data() {
    return {
      graph: null,
      selectedNode: null,
      nodeCounter: 0,
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.initGraph();
    });
  },
  beforeDestroy() {
    if (this.graph) {
      this.graph.destroy();
    }
  },
  methods: {
    async initGraph() {
      try {
        // 初始化拓扑数据
        const data = {
          nodes: [
            {
              id: "gateway",
              data: { type: "gateway", label: "网关", status: "online" },
              style: { x: 200, y: 200, fill: "#1890ff" },
            },
            {
              id: "server1",
              data: { type: "server", label: "服务器1", status: "online" },
              style: { x: 400, y: 100, fill: "#52c41a" },
            },
            {
              id: "server2",
              data: { type: "server", label: "服务器2", status: "online" },
              style: { x: 400, y: 300, fill: "#52c41a" },
            },
            {
              id: "database",
              data: { type: "database", label: "数据库", status: "warning" },
              style: { x: 600, y: 200, fill: "#fa8c16" },
            },
          ],
          edges: [
            {
              id: "edge1",
              source: "gateway",
              target: "server1",
              data: { label: "HTTP" },
            },
            {
              id: "edge2",
              source: "gateway",
              target: "server2",
              data: { label: "HTTP" },
            },
            {
              id: "edge3",
              source: "server1",
              target: "database",
              data: { label: "数据连接" },
            },
            {
              id: "edge4",
              source: "server2",
              target: "database",
              data: { label: "数据连接" },
            },
          ],
        };

        // 创建图实例
        this.graph = new Graph({
          container: this.$refs.container,
          width: this.$refs.container.clientWidth,
          height: 600,
          data,
          // 节点配置
          node: {
            style: {
              size: 50,
              stroke: "#1890ff",
              lineWidth: 2,
              cursor: "pointer",
            },
            // 标签配置
            labelText: (d) => d.data?.label || d.id,
            labelBackground: true,
            labelBackgroundStyle: {
              fill: "rgba(255, 255, 255, 0.8)",
              padding: [2, 4],
            },
            // 动画
            animation: {
              enter: "fade",
              update: "fade",
              exit: "fade",
            },
          },
          // 边配置
          edge: {
            style: {
              stroke: "#aaa",
              lineWidth: 2,
              endArrow: {
                type: "triangle",
                size: 8,
              },
            },
            labelText: (d) => d.data?.label || "",
            labelBackground: true,
          },
          // 布局
          layout: {
            type: "force",
            animated: true,
            center: [400, 300],
          },
          // 交互行为
          behaviors: [
            "drag-canvas",
            "zoom-canvas",
            "drag-element",
            "click-select",
          ],
          // 插件
          plugins: [
            {
              type: "grid-line",
              size: 20,
              color: "#f0f0f0",
            },
          ],
        });

        // 渲染图
        this.graph.render();

        // 绑定事件
        this.bindEvents();

        // 适应视图
        this.graph.fitView();
      } catch (error) {
        console.error("初始化拓扑图失败:", error);
      }
    },

    bindEvents() {
      if (!this.graph) return;

      // 节点点击事件
      this.graph.on("node:click", (event) => {
        const node = event.target;
        this.selectedNode = {
          id: node.id,
          data: node.data,
          style: node.style,
        };
      });

      // 画布点击事件
      this.graph.on("canvas:click", () => {
        this.selectedNode = null;
      });

      // 节点悬停效果
      this.graph.on("node:mouseenter", (event) => {
        const node = event.target;
        this.graph.updateNodeData([
          {
            id: node.id,
            style: {
              ...node.style,
              fill: "#ffccc7",
              lineWidth: 3,
            },
          },
        ]);
        this.graph.render();
      });

      this.graph.on("node:mouseleave", (event) => {
        const node = event.target;
        const originalFill =
          node.data?.type === "gateway"
            ? "#1890ff"
            : node.data?.type === "server"
            ? "#52c41a"
            : node.data?.type === "database"
            ? "#fa8c16"
            : "#9ec9ff";

        this.graph.updateNodeData([
          {
            id: node.id,
            style: {
              ...node.style,
              fill: originalFill,
              lineWidth: 2,
            },
          },
        ]);
        this.graph.render();
      });
    },

    // 工具栏方法
    addNode() {
      if (!this.graph) return;

      this.nodeCounter++;
      const newNode = {
        id: `node-${Date.now()}`,
        data: {
          type: "server",
          label: `服务器${this.nodeCounter}`,
          status: "online",
        },
        style: {
          x: Math.random() * 500 + 100,
          y: Math.random() * 400 + 100,
          fill: "#52c41a",
          size: 40,
        },
      };

      // 添加到图中
      this.graph.addData({
        nodes: [newNode],
        edges: [
          {
            id: `edge-${Date.now()}`,
            source: "gateway",
            target: newNode.id,
            data: { label: "新连接" },
          },
        ],
      });

      // 重新布局
      this.graph.layout();
    },

    removeNode() {
      debugger;
      console.log(11);
      if (!this.graph || !this.selectedNode) return;

      // 删除选中的节点
      this.graph.removeData({
        nodes: [this.selectedNode.id],
      });

      this.selectedNode = null;
    },

    zoomIn() {
      if (this.graph) {
        const currentZoom = this.graph.getZoom();
        this.graph.zoomTo(currentZoom * 1.2, { duration: 300 });
      }
    },

    zoomOut() {
      if (this.graph) {
        const currentZoom = this.graph.getZoom();
        this.graph.zoomTo(currentZoom * 0.8, { duration: 300 });
      }
    },

    fitView() {
      if (this.graph) {
        this.graph.fitView();
      }
    },

    clear() {
      if (this.graph) {
        this.graph.clear();
        this.selectedNode = null;
      }
    },
  },
};
</script>

<style scoped>
.topology-system {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
}

.toolbar button {
  padding: 8px 16px;
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.toolbar button:hover {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}

.graph-container {
  width: 100%;
  height: 600px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  background: white;
}

.info-panel {
  position: absolute;
  top: 100px;
  right: 20px;
  width: 250px;
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-panel h3 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 16px;
}

.info-content p {
  margin: 8px 0;
  color: #666;
}
</style>