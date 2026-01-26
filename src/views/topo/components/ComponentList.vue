<template>
    <div class="component-list">
        <div v-for="list in componentList" :key="list.type" class="tab-list">
            <div class="title"><i class="icon"></i>{{ list.label }}</div>
            <ul class="content">
                <li
                    v-for="(item, index) in list.children"
                    :key="item.nodeType"
                    class="item"
                    draggable
                    @dragstart="handleDragStart(item, $event)"
                    :data-index="index"
                >
                    <img :src="item.iconSrc" />
                    <span :title="item.label">{{ item.label }}</span>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import componentList from "./component-list";

export default {
    data() {
        return {
            componentList,
        };
    },
    methods: {
        handleDragStart(item, e) {
            let dragData = { ...item };
            e.dataTransfer.setData("node-type", JSON.stringify(dragData));
        },
    },
};
</script>

<style lang="scss" scoped>
.component-list {
    padding: 10px 20px;
    background: #333;
    .tab-list {
        cursor: grab;
        color: #333;
        color: #fff;
        overflow: hidden;
        margin-bottom: 20px;
        .title {
            font-size: 16px;
            line-height: 32px;
            margin-bottom: 14px;
            .icon {
                display: inline-block;
                width: 18px;
                height: 18px;
                margin-right: 7px;
                vertical-align: middle;
                background-image: url(~@/assets/images/icon/title-icon.png);
            }
        }
        .content {
            padding: 0 10px;
            margin-right: -25px;
        }
        .item {
            float: left;
            margin-right: 25px;
            text-align: center;
            img {
                display: block;
                width: 58px;
                height: 58px;
                margin: 0 auto 4px;
            }
        }
    }
}
</style>