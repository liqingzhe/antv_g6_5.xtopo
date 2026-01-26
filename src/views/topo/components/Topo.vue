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
                    style: {
                        size: 45,
                        fill: "#e6f7ff",
                        fillOpacity: 0,
                        stroke: "#1890ff",
                        lineWidth: 0,
                        labelFontSize: 12,
                        // 默认设置
                        // labelPlacement: 'bottom',
                        // // 多行文本添加
                        // labelMaxWidth: '200%',
                        // labelMaxLines: 1,
                        // labelTextOverflow: 'ellipsis',
                        labelTextAlign: 'center' // 默认left
                    },
                    labelText: (d) => d.data.label,
                },

                edge: {
                    style: {
                        stroke: "#fff",
                        lineWidth: 1,
                    },
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
                                    { name: '删除节点', value: 'delete', style: { color: 'red' } },
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
                                case 'delete':
                                    if (current?.id) {
                                        this.graph.removeData({ nodes: [current.id] });
                                        this.graph.render();
                                        console.log(`已删除节点11: ${current.id}`);
                                    }
                                    break;
                                case 'add-node': {
                                    let id = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                                    this.graph.addData({
                                        nodes: [{
                                            id,
                                            x: Math.random() * 600 + 100,
                                            y: Math.random() * 400 + 100
                                        }]
                                    });
                                    console.log(`已添加节点: ${id}`);
                                    break;
                                }
                                case 'detail':
                                    console.log('查看详细信息');
                                    break;
                                case 'delete-edge':
                                    if (current?.id) {
                                        this.graph.removeData({ edges: [current.id] });
                                        this.graph.render();
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


        bindEvents() {
            // 选中节点
            this.graph.on(NodeEvent.CLICK, (event) => {
                // 移除调试代码
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
                this.graph.setElementState(target.id, 'selected');
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
                id: `edge_${sourceId}_${targetId}_${Date.now()}`,
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

            // 可选：添加创建成功的视觉反馈
            this.highlightNewEdge(newEdge.id);
        },

        // 5. 清除选中状态
        clearSelection() {
            // 在 G6 v5.x 中，可能需要使用不同的方法来设置元素状态
            this.selectedNodes.forEach(node => {
                const nodeId = typeof node === 'object' ? node.id : node;
                if (nodeId) {
                    this.graph.setElementState(nodeId, 'selected', false);
                }
            });
            this.selectedNodes = [];
            console.log('已清除选中状态');
        },

        // 6. 高亮新创建的边（可选）
        highlightNewEdge(edgeId) {
            // 在 G6 v5.x 中，使用 getData 获取元素，而不是 findById
            const edges = this.graph.getData().edges || [];
            const edge = edges.find(e => e.id === edgeId);

            if (edge) {
                // 设置边的状态为激活
                this.graph.setElementState(edgeId, 'active', true);

                // 3秒后取消高亮
                setTimeout(() => {
                    this.graph.setElementState(edgeId, 'active', false);
                }, 3000);
            }
        },
        setupResizeListener() {
            window.addEventListener("resize", this.resize);
        },
        addTopoData() { },
        resize() {
            if (this.graph && this.$refs.container) {
                this.graph.setSize(
                    this.$refs.container.clientWidth,
                    this.$refs.container.clientHeight
                );
            }
        },

        // 添加节点
        addNode(node) {
            const newNode = {
                type: 'rect',
                id: node.id,
                data: {
                    label: `${node.label}`,
                    type: node.type,
                },
                style: {
                    x: node.x,
                    y: node.y,
                    iconWidth: node.iconWidth,
                    iconHeight: node.iconHeight,
                    iconSrc: node.iconSrc || "",
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
                type: nodeData.nodeType,
                label: nodeData.label,
                x,
                y,
                iconSrc: nodeData.iconSrc,
                iconWidth: nodeData.iconWidth,
                iconHeight: nodeData.iconHeight,
            });
        },

        handleDragOver(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
        },
        // rightClickHandler(item) {
        //     if (item.type == "bindDevice") {
        //         // 为图标组件绑定具体设备
        //         this.$emit("bindDevice", {
        //             text: item.text,
        //             type: item.type,
        //             node: this.currentNode,
        //         });
        //     } else if (item.type == "bindLinkDevice") {
        //         if (!this.currentNode.deviceId) {
        //             this.$message.warning("请先绑定设备");
        //             return false;
        //         }
        //         this.$emit("bindDevice", {
        //             text: item.text,
        //             type: item.type,
        //             node: this.currentNode,
        //         });
        //     } else if (item.type == "delete") {
        //         if (this.rightMenuType == "nodeMenu") {
        //             // 删除设备
        //             if (this.currentNode.parentId) {
        //                 let nodes =
        //                     this.scene.findElements((e) => {
        //                         return e.nodeId == this.currentNode.parentId;
        //                     }) || []; // 父节点手动删除该数据字段
        //                 nodes.forEach((node) => {
        //                     let index = node.children.findIndex((iitem) => {
        //                         return iitem.deviceId == this.currentNode.deviceId;
        //                     });
        //                     node.children.splice(index, 1);
        //                 });
        //             }
        //             this.scene.remove(this.currentNode);
        //             this.currentNode = null;
        //         } else if (this.rightMenuType == "linkMenu") {
        //             // 删除连线
        //             this.scene.remove(this.currentLink);
        //             this.currentLink = null;
        //         } else if (this.rightMenuType == "nodeRootMenu") {
        //             if (this.currentNode.children && this.currentNode.children.length) {
        //                 // 删除选中节点及其子节点
        //                 this.removeChildrenNodes();
        //                 this.currentNode.children = null;
        //             }
        //             this.scene.remove(this.currentNode);
        //             this.currentNode = null;
        //         }
        //     } else {
        //         // 刪除关联设备
        //         this.$confirm("确认删除关联设备？", "删除提示", {
        //             confirmButtonText: "确定",
        //             cancelButtonText: "取消",
        //             cancelButtonClass: "cancel-btn",
        //             confirmButtonClass: "confirm-btn",
        //             type: "warning",
        //         })
        //             .then(() => {
        //                 this.removeChildrenNodes();
        //                 this.currentNode.children = null;
        //             })
        //             .catch(() => {
        //                 this.$message({
        //                     type: "info",
        //                     message: "已取消删除",
        //                 });
        //             });
        //     }
        //     this.isShowRightMenu = false;
        //     return false;
        // },
        clearCanvas() {
            this.scene.clear();
        },
        // setBindData({ data, type }) {
        //     if (type == "bindDevice") {
        //         // 绑定设备
        //         this.currentNode.deviceId = data[0].deviceId; // 设备id
        //         this.currentNode.deviceType = data[0].deviceType; // 设备类型
        //         this.currentNode.deviceInfo = data[0].deviceInfo;
        //         this.currentNode.text = data[0].name;
        //     } else if (type == "bindLinkDevice") {
        //         // 绑定关联设备 自动生成拓扑图
        //         // todo 在画布中绘制。。。
        //         this.removeChildrenNodes();
        //         let children = data.map((item) => {
        //             return {
        //                 deviceId: item.deviceId,
        //                 deviceType: item.deviceType,
        //                 text: item.name,
        //                 deviceInfo: item.deviceInfo,
        //                 parentId: this.currentNode.nodeId,
        //             };
        //         });
        //         this.currentNode.children = children;
        //         this.gotoDraw(this.currentNode);
        //     }
        // },
        addLink() { },
        // generateTree(parentNode, children) {
        //     const deviceTypeList = {
        //         1: "Server",
        //         2: "Switch",
        //         3: "Input",
        //         4: "Export",
        //     };
        //     if (children.length) {
        //         for (let i = 0; i < children.length; i++) {
        //             let nodeType = deviceTypeList[children[i].deviceType];
        //             children[i].nodeType = nodeType;
        //             let node = this.addNode(children[i]);
        //             this.addLink({
        //                 nodeA: parentNode,
        //                 nodeZ: node,
        //                 isAuto: true,
        //                 linkType: children.length == 1 ? "Link" : "FlexionalLink",
        //             });

        //             node.setBound(
        //                 children[i].x,
        //                 children[i].y,
        //                 this.defaultNodeWidth,
        //                 this.defaultNodeHeigth
        //             );
        //         }
        //     }
        // },
        // gotoDraw(node) {
        //     // 绘制关联设备
        //     this.maxChildrenLength =
        //         this.maxChildrenLength > node.children.length
        //             ? this.maxChildrenLength
        //             : node.children.length;
        //     let width = Math.floor(this.$refs.center.offsetWidth);
        //     let gap = (width - node.width) / this.maxChildrenLength;
        //     gap = gap <= node.width ? node.width : gap;
        //     gap = gap > 5 * node.width ? 5 * node.width : gap;
        //     // let center = this.scene.getCenterLocation();

        //     node.children.forEach((item, index) => {
        //         if (index % 2 == 0) {
        //             // 3 1 0 2 4
        //             item.x = node.x + (index / 2) * gap;
        //         } else {
        //             item.x = node.x - ((index + 1) / 2) * gap;
        //         }
        //         item.y = node.y + 4 * node.height;
        //     });
        //     if (node.children.length % 2 == 0) {
        //         // 根节点位置不变，x坐标微调至子节点中点位置
        //         node.x = node.x - gap / 2;
        //     }
        //     this.generateTree(node, node.children);
        // },
        // removeChildrenNodes() {
        //     let nodes =
        //         this.scene.findElements((e) => {
        //             return e.parentId == this.currentNode.nodeId;
        //         }) || [];
        //     nodes.forEach((item) => {
        //         this.scene.remove(item);
        //     });
        // },


        // 获取当前画布中的所有元素
        getCurrentCanvasData() {

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
