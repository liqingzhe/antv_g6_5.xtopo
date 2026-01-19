<template>
  <div>
    <div ref="container" class="graph-container"></div>
  </div>
</template>

<script>
import { Graph, treeToGraphData } from "@antv/g6";
export default {
  name: "TreeTopo",
  data() {
    return {
      graph: null,
      selectedNode: null,
      nodeCounter: 0,
      treeData: {},
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.getData();
      this.initGraph();
    });
  },
  methods: {
    async initGraph() {
      this.graph = new Graph({
        container: this.$refs.container,
        width: this.$refs.container.clientWidth,
        height: 600,
        autoFit: "view",
        background: '#eee',
        data: this.treeData,
        // plugins: [{ type: 'grid-line', follow: false }], // 画布增加网格
        node: {
          style: {
            labelText: (d) => d.id,
            labelPlacement: "bottom",
            labelBackground: true,
            size: 20,
            stroke: "#5B8FF9",
            fill: "#C6E5FF",
            ports: [
              { placement: "right" },
              { placement: "left" },
              { placement: "top" },
              { placement: "bottom" },
            ],
          },
          animation: {
            enter: false,
          },
        },
        edge: {
          type: "polyline",
          style: {
            stroke: "#A3B1BF",
            endArrow: true,
          },
          animation: {
            enter: false,
          },
        },
        layout: {
          type: "compact-box", // dendrogram 底部对齐； 子元素对齐 compact-box
          direction: "TB",
          nodeSep: 40,
          rankSep: 100,
          preLayout: true,
        },
        behaviors: [
          "drag-canvas",
          "zoom-canvas",
          "drag-element",
          "collapse-expand",
        ],
      });

      this.graph.render();
    },

    getData() {
      const treeData = {
        id: "Internet",
        children: [
          {
            id: "Core Router",
            children: [
              {
                id: "Switch A",
                children: [
                  { id: "Server 1" },
                  { id: "Server 2" },
                  { id: "Workstation 1" },
                ],
              },
              {
                id: "Switch B",
                children: [
                  { id: "Server 3" },
                  { id: "Workstation 2" },
                  { id: "Workstation 3" },
                ],
              },
              {
                id: "Firewall",
                children: [
                  {
                    id: "DMZ Switch",
                    children: [{ id: "Web Server" }, { id: "Mail Server" }],
                  },
                ],
              },
            ],
          },
        ],
      };

      // Convert tree data to G6 graph data format
      this.treeData = treeToGraphData(treeData);
    },
  },
  beforeDestroy() {
    if (this.graph) {
      this.graph.destroy();
    }
  },
};
</script>

<style>
</style>