<template>
    <el-dialog
        :visible.sync="dialogVisible"
        :title="dialogTitle"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        @close="handleClose"
        append-to-body
        width="25%"
    >
        <el-form
            :model="form"
            ref="form"
            :rules="rules"
            label-width="80px"
            label-position="left"
            @submit.native.prevent
        >
            <div>
                <el-form-item label="拓扑名称" prop="name">
                    <el-input
                        v-model="form.name"
                        placeholder="请输入拓扑名称"
                        auto-complete="off"
                        clearable
                        size="small"
                        @keyup.enter.native="onSubmit"
                    ></el-input>
                </el-form-item>
            </div>
        </el-form>
        <div class="footer">
            <el-button type="primary" class="cancel-btn" @click="handleClose"
                >取消</el-button
            >
            <el-button type="primary" class="confirm-btn" @click="onSubmit"
                >确定</el-button
            >
        </div>
    </el-dialog>
</template>
<script>
import { addTopo } from "@/api/topo";

export default {
    props: {
        isVisible: {
            type: Boolean,
            value: false,
        },
    },
    data() {
        return {
            dialogVisible: false,
            dialogTitle: "新建拓扑",
            form: {
                name: "",
            },
            rules: {
                name: [
                    {
                        required: true,
                        message: "拓扑名称不能为空",
                        trigger: "blur",
                    },
                    {
                        min: 1,
                        max: 64,
                        message: "拓扑名称长度应在 1 到 64 个字符之间",
                        trigger: "blur",
                    },
                ],
            },
        };
    },
    methods: {
        showDialog() {
            this.dialogVisible = true;
        },
        handleClose() {
            this.form.name = "";
            this.dialogVisible = false;
        },
        //提交
        onSubmit() {
            this.$refs.form.validate((valid) => {
                if (valid) {
                    let params = {
                        name: this.form.name,
                    };
                    addTopo(params).then(({data}) => {
                        let tab = {
                            code: `Edit-${data}`,
                            title: this.form.name,
                            content: "Edit",
                        };
                        this.$store.commit("topo/addRouter", tab);
                        this.handleClose();
                    });
                }
            });
        },
    },
};
</script>
<style lang="scss" scoped>
.footer {
    text-align: right;
}
/deep/.el-dialog__body {
    padding: 20px 20px 0;
    .el-input__inner {
        background: transparent;
    }
}
</style>

