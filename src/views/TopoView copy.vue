<template>
  <div class="responsive-topology">
    <div class="header">
      <h2>可拖拽系统拓扑图</h2>
      <div class="controls">
        <label>
          <input type="checkbox" v-model="enableSnapToGrid"> 对齐网格
        </label>
        <label>
          <input type="checkbox" v-model="showGrid"> 显示网格
        </label>
        <label>
          网格大小:
          <input type="range" v-model="gridSize" min="10" max="50" step="5">
          {{ gridSize }}px
        </label>
      </div>
    </div>
    
    <div class="main-content">
      <!-- 节点面板 -->
      <div class="node-palette">
        <h3>节点库</h3>
        <div class="palette-items">
          <div 
            v-for="nodeType in nodeTypes" 
            :key="nodeType.id"
            class="palette-item"
            draggable="true"
            @dragstart="handleDragStart(nodeType)"
            @dragend="handleDragEnd"
          >
            <div 
              class="node-preview"
              :style="{
                background: nodeType.color,
                borderColor: nodeType.borderColor,
              }"
            >
              {{ nodeType.icon }}
            </div>
            <span>{{ nodeType.label }}</span>
          </div>
        </div>
      </div>
      
      <!-- 拓扑图区域 -->
      <div 
        ref="dropZone" 
        class="topology-dropzone"
        @dragover.prevent
        @drop="handleDrop"
      >
        <div ref="container" class="graph-container"></div>
      </div>
    </div>
    
    <!-- 属性面板 -->
    <div class="properties-panel">
      <h3>属性编辑器</h3>
      <div v-if="selectedElement">
        <div class="property-group">
          <label>名称:</label>
          <input v-model="selectedElement.data.label" @change="updateElement">
        </div>
        <div class="property-group">
          <label>类型:</label>
          <select v-model="selectedElement.data.type" @change="updateElementType">
            <option value="server">服务器</option>
            <option value="database">数据库</option>
            <option value="gateway">网关</option>
            <option value="cache">缓存</option>
          </select>
        </div>
        <div class="property-group">
          <label>位置:</label>
          <div class="position-controls">
            <input 
              type="number" 
              v-model="selectedElement.style.x"
              @change="updatePosition"
            >
            <input 
              type="number" 
              v-model="selectedElement.style.y"
              @change="updatePosition"
            >
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        请选择一个节点或连线进行编辑
      </div>
    </div>
  </div>
</template>

<script>
import { Graph } from '@antv/g6';

export default {
  name: 'ResponsiveTopology',
  data() {
    return {
      graph: null,
      selectedElement: null,
      enableSnapToGrid: true,
      showGrid: true,
      gridSize: 20,
      nodeTypes: [
        { id: 'server', label: '服务器', icon: '💻', color: '#f6ffed', borderColor: '#52c41a' },
        { id: 'database', label: '数据库', icon: '🗄️', color: '#fff0f6', borderColor: '#eb2f96' },
        { id: 'gateway', label: '网关', icon: '🚪', color: '#d6e4ff', borderColor: '#2f54eb' },
        { id: 'loadbalancer', label: '负载均衡', icon: '⚖️', color: '#e6fffb', borderColor: '#13c2c2' },
        { id: 'cache', label: '缓存', icon: '⚡', color: '#f9f0ff', borderColor: '#722ed1' },
      ],
      dragNodeType: null,
      dragOffset: { x: 0, y: 0 },
    };
  },
  mounted() {
    this.initGraph();
    this.setupResizeListener();
  },
  methods: {
    initGraph() {
      this.graph = new Graph({
        container: this.$refs.container,
        width: this.$refs.container.clientWidth,
        height: this.$refs.container.clientHeight,
        data: { nodes: [], edges: [] },
        
        node: {
          style: {
            size: 50,
            fill: '#e6f7ff',
            stroke: '#1890ff',
            lineWidth: 2,
          },
          labelText: (d) => d.data.label,
        },
        
        edge: {
          style: {
            stroke: '#8c8c8c',
            lineWidth: 2,
          },
        },
        
        behaviors: [
          'drag-canvas',
          'zoom-canvas',
          'drag-element',
          'click-select',
        ],
        
        plugins: [
          {
            type: 'grid-line',
            size: this.gridSize,
            color: '#f0f0f0',
            visible: this.showGrid,
          },
        ],
      });
      
      this.graph.render();
      this.bindEvents();
    },
    
    handleDragStart(nodeType) {
      this.dragNodeType = nodeType;
      this.dragOffset = { x: 0, y: 0 };
    },
    
    handleDragEnd() {
      this.dragNodeType = null;
    },
    
    handleDrop(event) {
      event.preventDefault();
      if (!this.dragNodeType) return;
      
      const containerRect = this.$refs.container.getBoundingClientRect();
      const x = event.clientX - containerRect.left;
      const y = event.clientY - containerRect.top;
      
      this.addNodeFromDrag(x, y);
    },
    
    addNodeFromDrag(x, y) {
      const nodeType = this.dragNodeType;
      const snapX = this.enableSnapToGrid 
        ? Math.round(x / this.gridSize) * this.gridSize 
        : x;
      const snapY = this.enableSnapToGrid 
        ? Math.round(y / this.gridSize) * this.gridSize 
        : y;
      
      const nodeId = `node-${Date.now()}`;
      const newNode = {
        id: nodeId,
        data: {
          label: `${nodeType.label}`,
          type: nodeType.id,
          status: 'online',
        },
        style: {
          x: snapX,
          y: snapY,
          fill: nodeType.color,
          stroke: nodeType.borderColor,
        },
      };
      
      this.graph.addData({
        nodes: [newNode],
      });
      
      this.graph.render();
    },
    
    updateElement() {
      if (!this.selectedElement) return;
      
      this.graph.updateNodeData([{
        id: this.selectedElement.id,
        data: this.selectedElement.data,
      }]);
      
      this.graph.render();
    },
    
    updateElementType() {
      if (!this.selectedElement) return;
      
      const nodeType = this.nodeTypes.find(t => t.id === this.selectedElement.data.type);
      if (nodeType) {
        this.selectedElement.style.fill = nodeType.color;
        this.selectedElement.style.stroke = nodeType.borderColor;
        
        this.graph.updateNodeData([{
          id: this.selectedElement.id,
          style: this.selectedElement.style,
        }]);
        
        this.graph.render();
      }
    },
    
    updatePosition() {
      if (!this.selectedElement) return;
      
      const snapX = this.enableSnapToGrid 
        ? Math.round(this.selectedElement.style.x / this.gridSize) * this.gridSize 
        : this.selectedElement.style.x;
      const snapY = this.enableSnapToGrid 
        ? Math.round(this.selectedElement.style.y / this.gridSize) * this.gridSize 
        : this.selectedElement.style.y;
      
      this.selectedElement.style.x = snapX;
      this.selectedElement.style.y = snapY;
      
      this.graph.updateNodeData([{
        id: this.selectedElement.id,
        style: {
          x: snapX,
          y: snapY,
        },
      }]);
      
      this.graph.render();
    },
    
    bindEvents() {
      this.graph.on('node:click', (event) => {
        this.selectedElement = event.target;
      });
      
      this.graph.on('canvas:click', () => {
        this.selectedElement = null;
      });
      
      this.graph.on('node:dragend', (event) => {
        const node = event.target;
        if (this.enableSnapToGrid) {
          const snapX = Math.round(node.style.x / this.gridSize) * this.gridSize;
          const snapY = Math.round(node.style.y / this.gridSize) * this.gridSize;
          
          node.style.x = snapX;
          node.style.y = snapY;
          
          this.graph.updateNodeData([{
            id: node.id,
            style: {
              x: snapX,
              y: snapY,
            },
          }]);
          
          this.graph.render();
        }
      });
    },
    
    setupResizeListener() {
      window.addEventListener('resize', () => {
        if (this.graph && this.$refs.container) {
          this.graph.setSize(
            this.$refs.container.clientWidth,
            this.$refs.container.clientHeight
          );
        }
      });
    },
  },
  
  watch: {
    showGrid(val) {
        debugger
      if (this.graph) {
        const gridPlugin = this.graph.getPlugins().find(p => p.type === 'grid-line');
        if (gridPlugin) {
          gridPlugin.visible = val;
          this.graph.render();
        }
      }
    },
    
    gridSize(val) {
      if (this.graph) {
        const gridPlugin = this.graph.getPlugins().find(p => p.type === 'grid-line');
        if (gridPlugin) {
          gridPlugin.size = parseInt(val);
          this.graph.render();
        }
      }
    },
  },
};
</script>

<style scoped>
.responsive-topology {
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: #f5f5f5;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header h2 {
  margin: 0;
  color: #333;
}

.controls {
  display: flex;
  gap: 20px;
  align-items: center;
}

.controls label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.main-content {
  display: flex;
  flex: 1;
  gap: 20px;
  margin-bottom: 20px;
}

.node-palette {
  width: 200px;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.node-palette h3 {
  margin: 0 0 20px 0;
  color: #333;
}

.palette-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.palette-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  cursor: move;
  transition: all 0.3s;
}

.palette-item:hover {
  border-color: #1890ff;
  transform: translateX(5px);
}

.node-preview {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  border: 2px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.topology-dropzone {
  flex: 1;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.graph-container {
  width: 100%;
  height: 100%;
}

.properties-panel {
  width: 300px;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.properties-panel h3 {
  margin: 0 0 20px 0;
  color: #333;
}

.property-group {
  margin-bottom: 15px;
}

.property-group label {
  display: block;
  margin-bottom: 5px;
  color: #666;
  font-weight: 500;
}

.property-group input,
.property-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.position-controls {
  display: flex;
  gap: 10px;
}

.position-controls input {
  flex: 1;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-style: italic;
}
</style>