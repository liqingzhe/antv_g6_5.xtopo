<template>
    <div ref="center" class="center">
        <div ref="container" class="graph-container" @drop="handleDrop" @dragover="handleDragOver"></div>

        <!-- 鼠标右键操作框 -->
        <div v-if="isShowRightMenu" class="box-card" :style="'top:' +
            rightMenuPosition.top +
            'px;left:' +
            rightMenuPosition.left +
            'px'
            ">
            <div v-for="item in rightMenu[rightMenuType]" :key="item.text" class="card"
                @click="rightClickHandler(item)">
                {{ item.text }}
            </div>
        </div>
    </div>
</template>

<script>

// import { addTopoData } from "@/api/topo.js";
import { Graph } from "@antv/g6";

export default {
    name: "MyTopo",
    components: {},
    computed: {},
    watch: {},
    data() {
        return {
            type: "", // 编辑模式edit 详情模式detail
            graph: null, // 图表实例
            gridSize: 20,
            startNode: null,
            endNode: null,
            lineStart: null, //画线起点
            lineEnd: null, // 画线终点
            lineType: "Link", // 连线类型
            link: null, // 连线
            currentNode: {}, // 当前节点
            currentLink: {}, //当前连线
            virtualNode: null, //解决缩放拖拽问题
            scale: 0.95,
            isShowRightMenu: false,
            rightMenu: {
                nodeRootMenu: [
                    {
                        text: "绑定设备",
                        type: "bindDevice",
                    },
                    {
                        text: "绑定关联设备",
                        type: "bindLinkDevice",
                    },
                    {
                        text: "删除",
                        // type: "delete",
                    },
                    {
                        text: "删除关联设备",
                        // type: "deleteLinkDevice",
                    },
                ],
                nodeMenu: [
                    {
                        text: "删除",
                        // type: "delete",
                    },
                ],
                linkMenu: [
                    {
                        text: "删除",
                        // type: "delete",
                    },
                ],
            },
            rightMenuPosition: {
                top: 0,
                left: 0,
            },
            nodeKey: [
                // "elementType", // 区分是节点 还是线
                "nodeType", // 设备类型（交换机、PC，区分鼠标右键操作）
                "x", // 节点中心坐标x
                "y", // 节点中心坐标x
                "width", //节点宽度
                "height", // 节点高度
                "nodeId", //前端自动生成的唯一标识
                "deviceId", // 节点绑定的设备id
                "deviceType", // 节点绑定的设备类型
                "parentId", // 父节点
                "children", // 关联子节点
                "deviceInfo", // 绑定的设备信息
                "text", // 文本描述
                "zIndex", // 层级
                "fontColor", // 字体颜色
                // "icon", // 设备icon（base64）
            ],
            lineKey: [
                // "elementType", // 区分是节点 还是线
                "arrowsRadius", // 终点箭头大小
                "lineWidth", // 线宽
                "nodeStartId", // 起始节点
                "nodeEndId", // 终止节点
                "isEditable", // 是否可删除
                "linkType", // 连线类型（直线、折线）
                "zIndex", // 层级
            ],
            wheelZoom: 0.85,
            textOffsetY: 5,
            dashedPattern: 5,
            maxChildrenLength: 0, // 最大子节点数
            defaultNodeWidth: 40, // 默认节点宽度
            defaultNodeHeigth: 40, // 默认节点高度
            mouseDownPosition: null, // 鼠标操作的目标
        };
    },
    created() { },
    mounted() {
        this.initGraph();
        this.setupResizeListener();
    },
    methods: {
        initGraph() {
            document.documentElement.oncontextmenu = () => {
                // 浏览器默认右键菜单隐藏
                return false;
            };
            this.graph = new Graph({
                container: this.$refs.container,
                width: this.$refs.container.clientWidth,
                height: this.$refs.container.clientHeight,
                data: { nodes: [], edges: [] },
                node: {
                    style: {
                        size: 50,
                        fill: "#e6f7ff",
                        stroke: "#1890ff",
                        lineWidth: 2,
                    },
                    labelText: (d) => d.data.label,
                },

                edge: {
                    style: {
                        stroke: "#8c8c8c",
                        lineWidth: 2,
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
                        visible: true,
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
                                        console.log(`已删除连线: ${current.id}`);
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
            console.log(this.graph, "graph", Graph.version);

            this.graph.render();
        },
        createMenuFromItems(items) {
            return items.map(item =>
                `<div class="menu-item" data-key="${item.key}" style="${item.style || ''}">
                    ${item.name} </div>`
            ).join('');
        },
        setupResizeListener() {
            window.addEventListener("resize", () => {
                if (this.graph && this.$refs.container) {
                    this.graph.setSize(
                        this.$refs.container.clientWidth,
                        this.$refs.container.clientHeight
                    );
                }
            });
        },
        addTopoData() { },
        resize() { },
        setCanvasArea() {
            let center = this.$refs.center;
            this.canvas.width = Math.floor(center.offsetWidth);
            this.canvas.height = Math.floor(center.offsetHeight);
        },
        // 添加节点
        addNode(node) {
            const newNode = {
                id: node.id,
                data: {
                    label: `${node.label}`,
                    type: node.type,
                    status: "online",
                },
                style: {
                    x: node.x,
                    y: node.y,
                    fill: node.color || "#000",
                    stroke: node.borderColor || "#000",
                },
            };
            this.graph.addData({
                nodes: [newNode],
            });

            this.graph.render();
            // let node = new JTopo.Node();
            // // 节点图片
            // let icon = require(`@/assets/images/topo/${nodeData.nodeType}.png`);
            // if (icon) {
            //     node.setImage(icon);
            //     node.icon = icon;
            // }
            // // 节点数据
            // node.nodeId = nodeData.nodeId ? nodeData.nodeId : generateUUID(); // 唯一ID
            // node.deviceId = nodeData.deviceId; // 绑定的设备id
            // node.deviceType = nodeData.deviceType; // 绑定的设备类型
            // node.nodeType = nodeData.nodeType; // 设备类型（交换机、PC，区分鼠标右键操作）
            // node.deviceInfo = nodeData.deviceInfo ? nodeData.deviceInfo : null; // 绑定的设备信息
            // node.text = nodeData.text; // 文字描述
            // node.textOffsetY = this.textOffsetY; // 文字的向下偏移量
            // // this.type == "edit" && (node.text = nodeData.text); // 文字描述
            // node.children = nodeData.children ? nodeData.children : []; // 关联设备信息
            // node.fontColor = nodeData.fontColor || "255,255,255"; // 字体颜色
            // nodeData.parentId && (node.parentId = nodeData.parentId); // 父节点
            // nodeData.zIndex && (node.zIndex = nodeData.zIndex); // 节点层级
            // // 详情页不支持拖拽
            // if (this.type == "detail") {
            //     node.dragable = false;
            // }
            // // if (this.type == "edit") {
            // //     // 进行了缩放 保证节点的放置位置
            // //     this.virtualNode = node;
            // //     node.visible = false;
            // // }
            // // node.editAble = nodeData.editAble || true
            // this.scene.add(node);
            // node.addEventListener("mouseup", (e) => {
            //     if (this.type == "edit" && e.button == 2) {
            //         // 右键
            //         this.currentNode = node;
            //         this.rightMenuType =
            //             node.nodeType == "Switch" ? "nodeRootMenu" : "nodeMenu";
            //         this.isShowRightMenu = true;
            //         this.rightMenuPosition.top = e.pageY;
            //         this.rightMenuPosition.left = e.pageX;
            //     }
            // });
            // node.addEventListener("mouseover", (e) => {
            //     this.$emit("nodeHover", { e, node });
            // });
            // node.addEventListener("mouseout", (e) => {
            //     this.$emit("nodeMouseOut", { e, node });
            // });
            // return node;
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
                label: nodeData.label,
                x,
                y,
                type: nodeData.nodeType,
                style: {
                    fill: "#1890ff",
                },
            });
        },

        handleDragOver(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
        },
        rightClickHandler(item) {
            if (item.type == "bindDevice") {
                // 为图标组件绑定具体设备
                this.$emit("bindDevice", {
                    text: item.text,
                    type: item.type,
                    node: this.currentNode,
                });
            } else if (item.type == "bindLinkDevice") {
                if (!this.currentNode.deviceId) {
                    this.$message.warning("请先绑定设备");
                    return false;
                }
                this.$emit("bindDevice", {
                    text: item.text,
                    type: item.type,
                    node: this.currentNode,
                });
            } else if (item.type == "delete") {
                if (this.rightMenuType == "nodeMenu") {
                    // 删除设备
                    if (this.currentNode.parentId) {
                        let nodes =
                            this.scene.findElements((e) => {
                                return e.nodeId == this.currentNode.parentId;
                            }) || []; // 父节点手动删除该数据字段
                        nodes.forEach((node) => {
                            let index = node.children.findIndex((iitem) => {
                                return iitem.deviceId == this.currentNode.deviceId;
                            });
                            node.children.splice(index, 1);
                        });
                    }
                    this.scene.remove(this.currentNode);
                    this.currentNode = null;
                } else if (this.rightMenuType == "linkMenu") {
                    // 删除连线
                    this.scene.remove(this.currentLink);
                    this.currentLink = null;
                } else if (this.rightMenuType == "nodeRootMenu") {
                    if (this.currentNode.children && this.currentNode.children.length) {
                        // 删除选中节点及其子节点
                        this.removeChildrenNodes();
                        this.currentNode.children = null;
                    }
                    this.scene.remove(this.currentNode);
                    this.currentNode = null;
                }
            } else {
                // 刪除关联设备
                this.$confirm("确认删除关联设备？", "删除提示", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    cancelButtonClass: "cancel-btn",
                    confirmButtonClass: "confirm-btn",
                    type: "warning",
                })
                    .then(() => {
                        this.removeChildrenNodes();
                        this.currentNode.children = null;
                    })
                    .catch(() => {
                        this.$message({
                            type: "info",
                            message: "已取消删除",
                        });
                    });
            }
            this.isShowRightMenu = false;
            return false;
        },
        clearCanvas() {
            this.scene.clear();
        },
        setBindData({ data, type }) {
            if (type == "bindDevice") {
                // 绑定设备
                this.currentNode.deviceId = data[0].deviceId; // 设备id
                this.currentNode.deviceType = data[0].deviceType; // 设备类型
                this.currentNode.deviceInfo = data[0].deviceInfo;
                this.currentNode.text = data[0].name;
            } else if (type == "bindLinkDevice") {
                // 绑定关联设备 自动生成拓扑图
                // todo 在画布中绘制。。。
                this.removeChildrenNodes();
                let children = data.map((item) => {
                    return {
                        deviceId: item.deviceId,
                        deviceType: item.deviceType,
                        text: item.name,
                        deviceInfo: item.deviceInfo,
                        parentId: this.currentNode.nodeId,
                    };
                });
                this.currentNode.children = children;
                this.gotoDraw(this.currentNode);
            }
        },
        addLink() { },
        generateTree(parentNode, children) {
            const deviceTypeList = {
                1: "Server",
                2: "Switch",
                3: "Input",
                4: "Export",
            };
            if (children.length) {
                for (let i = 0; i < children.length; i++) {
                    let nodeType = deviceTypeList[children[i].deviceType];
                    children[i].nodeType = nodeType;
                    let node = this.addNode(children[i]);
                    this.addLink({
                        nodeA: parentNode,
                        nodeZ: node,
                        isAuto: true,
                        linkType: children.length == 1 ? "Link" : "FlexionalLink",
                    });

                    node.setBound(
                        children[i].x,
                        children[i].y,
                        this.defaultNodeWidth,
                        this.defaultNodeHeigth
                    );
                }
            }
        },
        gotoDraw(node) {
            // 绘制关联设备
            this.maxChildrenLength =
                this.maxChildrenLength > node.children.length
                    ? this.maxChildrenLength
                    : node.children.length;
            let width = Math.floor(this.$refs.center.offsetWidth);
            let gap = (width - node.width) / this.maxChildrenLength;
            gap = gap <= node.width ? node.width : gap;
            gap = gap > 5 * node.width ? 5 * node.width : gap;
            // let center = this.scene.getCenterLocation();

            node.children.forEach((item, index) => {
                if (index % 2 == 0) {
                    // 3 1 0 2 4
                    item.x = node.x + (index / 2) * gap;
                } else {
                    item.x = node.x - ((index + 1) / 2) * gap;
                }
                item.y = node.y + 4 * node.height;
            });
            if (node.children.length % 2 == 0) {
                // 根节点位置不变，x坐标微调至子节点中点位置
                node.x = node.x - gap / 2;
            }
            this.generateTree(node, node.children);
        },
        removeChildrenNodes() {
            let nodes =
                this.scene.findElements((e) => {
                    return e.parentId == this.currentNode.nodeId;
                }) || [];
            nodes.forEach((item) => {
                this.scene.remove(item);
            });
        },
        createStageFromJson(topoJson) {
            this.scene.translateX = topoJson.scene?.translateX || 0;
            this.scene.translateY = topoJson.scene?.translateY || 0;
            topoJson.nodeList.forEach((item) => {
                let node = this.addNode(item);
                node.setBound(item.x, item.y, item.width, item.height);
            });
            topoJson.lineList.forEach((item) => {
                let nodeA = this.scene.findElements((e) => {
                    return e.nodeId == item.nodeStartId;
                })[0];
                let nodeZ = this.scene.findElements((e) => {
                    return e.nodeId == item.nodeEndId;
                })[0];
                this.addLink({ nodeA, nodeZ, ...item });
            });
        },

        // 获取当前画布中的所有元素
        getCurrentCanvasData() {
            let elements = this.scene.getDisplayedElements();
            elements.reverse(); // 将node置于link之前
            let nodeList = [];
            let lineList = [];
            elements.forEach((item) => {
                if (item.elementType == "node") {
                    //点
                    let element = {};
                    this.nodeKey.forEach((key) => {
                        element[key] = item[key];
                    });
                    nodeList.push(element);
                } else if (item.elementType == "link") {
                    // 连线
                    let element = {};
                    this.lineKey.forEach((key) => {
                        element[key] = item[key];
                    });
                    lineList.push(element);
                }
            });
            let topologyId = this.curTab.split("-")[1];
            let scene = {
                translateX: this.scene.translateX,
                translateY: this.scene.translateY,
            }; // 画布拖拽偏移量
            let canvasData = {
                topologyId,
                scene,
                lineList,
                nodeList,
            };
            return canvasData;
        },
        saveCanvas() {
            // 后端需要的数据字段
            //  {
            //       "elementType": 1,
            //       "x": 100,
            //       "y": 100,
            //       "width": 300,
            //       "height": 500,
            //       "nodeId": "1234",
            //       "parentId": "-1",
            //       "deviceId": "deviceId",
            //       "deviceType": 3,
            //       "text": "Root",
            //       "fontColor": "
            //       "icon": "223",
            //       "children": [],
            //       "zIndex": 0
            //     },
            // let params = this.getCurrentCanvasData();
            // addTopoData(params).then(() => {
            //     this.$message.success("保存成功！");
            // });
        },
        // 显示节点的text属性
        showNodeText(key) {
            let elements = this.scene.getDisplayedNodes();
            elements.forEach((item) => {
                if (item.text) {
                    if (item.text.indexOf(item.deviceInfo[key]) == -1) {
                        // 不包含该属性
                        item.text += " " + item.deviceInfo[key];
                    }
                } else {
                    item.text += item.deviceInfo[key];
                }
            });
        },
        hideNodeText(key) {
            let nodes =
                this.scene.findElements((e) => {
                    return e.nodeType == (key == "deviceIp" ? "textIp" : "textNode");
                }) || [];
            nodes.forEach((item) => {
                this.scene.remove(item);
            });
        },
    },
    beforeDestroy() {
        if (this.graph) {
            this.graph.destroy();
        }
        window.removeEventListener("resize", this.resize);
        document.documentElement.oncontextmenu = () => {
            return true;
        };
    },
};
</script>

<style scoped lang="scss">
/* 确保菜单可见的基础样式 */

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
