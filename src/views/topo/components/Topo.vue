<template>
    <div ref="center" class="center">
        <div ref="container" class="graph-container" @drop="handleDrop" @dragover="handleDragOver"></div>
    </div>
</template>

<script>
// import { addTopoData } from "@/api/topo.js";
/* eslint-disable */
import { Graph, NodeEvent, EdgeEvent } from "@antv/g6";
/* eslint-disable */
export default {
    name: "MyTopo",
    components: {},
    computed: {},
    watch: {},
    data() {
        return {
            type: "", // 编辑模式edit 详情模式detail
            graph: null, // 图表实例
            gridSize: 0,
            selectedNodes: [], // 被选中的节点
            nodeCounter: 0,
        };
    },
    created() { },
    mounted() {
        this.initGraph();
        this.bindEvents();
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
                    size: [80, 80],
                    state: {
                        active: {
                            fill: 'red',
                            lineWidth: 2,

                        },
                        // // 悬停状态（可选）
                        // highlight: {
                        //     stroke: '#FF6A00',
                        //     lineWidth: 2,
                        // },
                        // disabled: {
                        //     stroke: '#BFBFBF',
                        //     opacity: 0.5,
                        // },
                    },
                    style: {
                        labelText: (d) => d.data.label,
                        labelColor: '#000',
                        // stroke: '#CCC',
                        // lineWidth: 1,
                        // labelFontSize: 12,
                        // 默认设置
                        labelPlacement: 'bottom',
                        // 多行文本添加
                        labelMaxWidth: '200%',
                        labelMaxLines: 1,
                        labelTextOverflow: 'ellipsis',
                        labelTextAlign: 'center' // 默认left
                    },
                },

                edge: {
                    style: {
                        stroke: "#fff",
                        lineWidth: 1,
                    },
                    state: {
                        selected: {
                            stroke: 'red',
                            lineWidth: 1,
                        },
                        highlight: {
                            stroke: 'red',
                            lineWidth: 1,
                        }
                    }
                },

                behaviors: [
                    "drag-canvas",
                    "zoom-canvas",
                    "drag-element",
                    "click-select",
                ],

                plugins: [
                    {
                        type: "grid-line",
                        size: this.gridSize,
                        color: "#ccc",
                        visible: false,
                    },
                    {
                        type: 'contextmenu',
                        // 只在节点上开启右键菜单，默认全部元素都开启
                        getItems: (event) => {
                            let target = event.target;
                            let menuItems = [];
                            if (target && target.type === 'node') {
                                // 右键节点时的菜单
                                menuItems = [
                                    { name: '查看详情', value: 'detail' },
                                    { name: '编辑节点', value: 'edit' },
                                    { name: '删除节点', value: 'delete-node', style: { color: 'red' } },
                                ];
                            } else if (target && target.type === 'edge') {
                                // 右键边时的菜单
                                menuItems = [{ name: '删除连线', value: 'delete-edge' }];
                            } else {
                                // 右键画布空白处的菜单
                                menuItems = [{ name: '添加节点', value: 'add-node' }];
                            }
                            return menuItems;
                        },
                        // value: 对应菜单项的 value 
                        // target: 对应菜单项容器的 dom 节点
                        // current: 对应触发菜单项的元素，例如是节点则可以通过 current 来获取到节点的信息(id)等，或者来对元素进行修改

                        onClick: (value, target, current) => {
                            console.log(value, target, current);
                            switch (value) {
                                case 'delete-node':
                                    if (current?.id) {
                                        this.deleteNode(current.id);
                                    }
                                    break;
                                case 'add-node': {
                                    // let id = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                                    // this.graph.addData({
                                    //     nodes: [{
                                    //         id,
                                    //         x: Math.random() * 600 + 100,
                                    //         y: Math.random() * 400 + 100
                                    //     }]
                                    // });
                                    console.log(`已添加节点: ${id}`);
                                    break;
                                }
                                case 'detail':
                                    console.log('查看详细信息');
                                    break;
                                case 'delete-edge':
                                    if (current?.id) {
                                        this.deleteEdge(current.id);
                                    }
                                    break;
                                default:
                                    console.log(`执行: ${value}`);
                            }
                        },
                        // 可选的样式定制
                        offset: [8, 8], // 菜单相对于鼠标的偏移量
                        className: 'custom-contextmenu', // 自定义菜单容器的 CSS 类名
                    },
                ],
            });
            this.graph.render();
        },

        // 删除节点方法
        deleteNode(nodeId) {
            // 检查是否有与该节点相连的边，如果有则一并删除
            const edges = this.graph.getData().edges || [];
            const connectedEdges = edges.filter(edge =>
                edge.source === nodeId || edge.target === nodeId
            );

            // 删除与该节点相关的所有边
            if (connectedEdges.length > 0) {
                const edgeIds = connectedEdges.map(edge => edge.id);
                this.graph.removeData({ edges: edgeIds });
                console.log(`已删除与节点 ${nodeId} 相关的边:`, edgeIds);
            }

            // 删除节点本身
            this.graph.removeData({ nodes: [nodeId] });
            this.graph.render();
            console.log(`已删除节点: ${nodeId}`);

            // 从选中节点数组中移除该节点
            this.selectedNodes = this.selectedNodes.filter(node =>
                typeof node === 'object' ? node.id !== nodeId : node !== nodeId
            );
        },

        // 删除边方法
        deleteEdge(edgeId) {
            this.graph.removeData({ edges: [edgeId] });
            this.graph.render();
            console.log(`已删除连线: ${edgeId}`);
        },
        bindEvents() {
            // 选中节点
            this.graph.on(NodeEvent.CLICK, (event) => {
                debugger
                const { target } = event; // 获取被点击节点的 ID
                if (!target || !target.id) {
                    console.warn('点击事件中未找到有效的节点ID');
                    return;
                }

                console.log(`节点 ${target.id} 被点击了`);

                // 获取节点数据
                const nodeData = this.graph.getNodeData(target.id);
                if (!nodeData) {
                    console.warn(`无法获取节点 ${target.id} 的数据`);
                    return;
                }

                console.log('节点数据:', nodeData);

                // 防止重复选中同一节点
                const isNodeAlreadySelected = this.selectedNodes.some(node =>
                    typeof node === 'object' ? node.id === nodeData.id : node === nodeData.id
                );
                if (isNodeAlreadySelected) {
                    console.log(`节点 ${target.id} 已经被选中`);
                    return;
                }

                // 修改节点状态
                // this.graph.setElementState(target.id, 'selected');
                this.graph.updateNodeData([
                    {
                        id: target.id,
                        style: {
                            src: nodeData.data.iconAlertSrc || "",
                        }
                    },
                ]);
                this.graph.draw();

                this.selectedNodes.push(nodeData);

                // 如果选中了2个节点，创建连线
                if (this.selectedNodes.length === 2) {
                    this.createEdgeBetweenNodes(this.selectedNodes[0], this.selectedNodes[1]);
                    this.clearSelection();
                }
            });
        },
        // 4. 创建连线的函数
        createEdgeBetweenNodes(sourceNode, targetNode) {
            // 在G6 v5.x中，节点数据结构可能不同，需要适配新的API
            // 尝试多种方式获取节点ID
            let sourceId, targetId;

            // 方式1: 直接从节点对象获取id属性
            if (sourceNode.id && targetNode.id) {
                sourceId = sourceNode.id;
                targetId = targetNode.id;
            }
            // 方式2: 如果有getModel方法（兼容旧版）
            else if (typeof sourceNode.getModel === 'function' && typeof targetNode.getModel === 'function') {
                sourceId = sourceNode.getModel().id;
                targetId = targetNode.getModel().id;
            }
            // 方式3: 如果节点对象本身就是数据对象
            else if (sourceNode.data && targetNode.data) {
                sourceId = sourceNode.data?.id || sourceNode.id;
                targetId = targetNode.data?.id || targetNode.id;
            } else {
                console.error('无法获取节点ID:', sourceNode, targetNode);
                return;
            }

            // 避免自连接
            if (sourceId === targetId) {
                console.log('不能连接节点到自身');
                return;
            }

            // 检查边是否已存在
            const edges = this.graph.getData().edges || [];
            const edgeExists = edges.some(edge =>
                (edge.source === sourceId && edge.target === targetId) ||
                (edge.source === targetId && edge.target === sourceId)
            );

            if (edgeExists) {
                console.log('边已存在');
                return;
            }

            // 创建新边
            const newEdge = {
                id: `edge-${sourceId}-to-${targetId}`,
                type: 'line',
                source: sourceId,
                target: targetId,
                label: `连线${edges.length + 1}`,
            };

            // 添加边
            this.graph.addData({
                edges: [newEdge]
            });
            this.graph.render();

            console.log(`已创建连接: ${sourceId} -> ${targetId}`);

        },

        // 清除选中状态
        clearSelection() {
            this.selectedNodes.forEach(node => {
                const nodeId = typeof node === 'object' ? node.id : node;
                if (nodeId) {
                    this.graph.updateNodeData([
                        {
                            id: nodeId,
                            style: {
                                src: node.data.iconSrc || "",
                            }
                        },
                    ]);
                }
            })
            this.graph.draw();
            this.selectedNodes = [];
            console.log('已清除选中状态');
        },
        setupResizeListener() {
            window.addEventListener("resize", this.resize);
        },
        addTopoData() { },

        // 添加节点
        addNode(node) {
            // 矩形节点
            // const newNode = {
            //     type: 'rect',
            //     id: node.id,
            //     data: {
            //         label: `${node.label}`,
            //         nodeType: node.nodeType,
            //     },
            //     style: {
            //         x: node.x,
            //         y: node.y,
            //         iconWidth: node.iconWidth,
            //         iconHeight: node.iconHeight,
            //         iconSrc: node.iconSrc || "",
            //     },
            // };
            // 图片节点
            const newNode = {
                type: 'image',
                id: node.id,
                data: node.nodeData,
                style: {
                    x: node.x,
                    y: node.y,
                    size: [node.nodeData.iconWidth, node.nodeData.iconHeight],
                    src: node.nodeData.iconSrc || "",
                },
            };
            this.graph.addData({
                nodes: [newNode],
            });
            this.graph.render();
        },

        handleDrop(e) {
            e.preventDefault();
            e.stopPropagation();
            let nodeData = JSON.parse(e.dataTransfer.getData("node-type"));
            // 节点坐标
            let canvasPoint = this.graph.getCanvasByClient([e.clientX, e.clientY]);
            console.log(canvasPoint, "dragPointPositon");
            let x = canvasPoint[0];
            let y = canvasPoint[1];

            this.addNode({
                id: `node-${Date.now()}`,
                x,
                y,
                nodeData
            });
        },

        handleDragOver(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
        },

        // 清空画布
        clearCanvas() {
            this.graph.clear();
        },
        // 获取当前画布中的所有元素
        saveDatas() {
            const graphData = this.graph.getData();
            console.log('节点数据:', graphData.nodes);
            console.log('边数据:', graphData.edges);
            console.log('组合数据:', graphData.combos);
        },
        // 下载图像文件
        downloadImage(dataUrl, filename) {
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },
        // 下载拓扑图为PNG
        async downloadAsPNG() {
            try {
                const imgData = await this.graph.toDataURL('image/png');
                this.downloadImage(imgData, 'topology-diagram.png');
            } catch (error) {
                console.error('导出PNG失败:', error);
                alert('导出PNG失败，请重试');
            }
        },

        // 下载拓扑图为JPEG
        async downloadAsJPEG() {
            try {
                const imgData = await this.graph.toDataURL('image/jpeg');
                this.downloadImage(imgData, 'topology-diagram.jpg');
            } catch (error) {
                console.error('导出JPEG失败:', error);
                alert('导出JPEG失败，请重试');
            }
        },
        // 下载拓扑图为SVG
        async downloadAsSVG() {
            try {
                const svgData = await this.graph.toDataURL('image/svg+xml');
                this.downloadImage(svgData, 'topology-diagram.svg');
            } catch (error) {
                console.error('导出SVG失败:', error);
                alert('导出SVG失败，请重试');
            }
        },
        resize() {
            if (this.graph && this.$refs.container) {
                this.graph.setSize(
                    this.$refs.container.clientWidth,
                    this.$refs.container.clientHeight
                );
            }
        },
    },
    beforeDestroy() {
        if (this.graph) {
            this.graph.destroy();
        }
        window.removeEventListener("resize", this.resize);
    },
};
</script>

<style scoped lang="scss">
.center {
    width: 100%;
    //   background-color: #182530;
    border: 1px solid red;
    height: calc(100% - 40px);
    overflow: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    .graph-container {
        width: 100%;
        height: 100%;
    }

    .box-card {
        cursor: pointer;
        color: #111;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        background-color: #ffffff;
        text-align: left;
        border-radius: 2px;
        border: solid 1px #17303a;
        background-image: linear-gradient(90deg, #14495f 0%, #103240 100%);

        .card {
            font-size: 14px;
            width: 140px;
            height: 34px;
            line-height: 34px;
            padding-left: 10px;
            color: #fff;

            &:active {
                background-color: rgba(0, 255, 255, 0.4);
            }

            &:hover {
                background-color: rgba(0, 255, 255, 0.4);
            }

            &:last-child {
                border-bottom: none;
            }
        }
    }
}
</style>
