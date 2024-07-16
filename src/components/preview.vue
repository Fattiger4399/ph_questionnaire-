<template>
    <div class="center">
        <div class="item-main">
            <!-- <FormBuild :key="key" :preview="preview" :formTemplate="formTemplate" :models="models" :config="ngConfig"
                ref="formBuild" :customComponents="customComponents" /> -->
            <FormBuild :formTemplate="formTemplate" ref="formBuild"/>
        </div>
        <div class="button">
            <el-button type="" @click="showsth">
                提交
            </el-button>
        </div>
    </div>
</template>

<script>
import FormBuild from '../packages/form-design/build.vue'
import LocalMixin from '../locale/mixin.js'
export default {
    mixins: [LocalMixin],
    components: {
        FormBuild
    },
    data() {
        return {
            formTemplate: {

            }
        }
    },
    methods: {
        removeQuotesFromKeys(obj) {
            // 创建一个新的对象用于存放处理后的结果
            let newObj = {};

            // 遍历原对象的每个属性
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    // 去除键中的双引号
                    let newKey = key.replace(/"/g, '');

                    // 如果值是对象，则递归调用此函数
                    if (typeof obj[key] === 'object' && obj[key] !== null) {
                        newObj[newKey] = removeQuotesFromKeys(obj[key]);
                    } else {
                        // 否则直接复制值
                        newObj[newKey] = obj[key];
                    }
                }
            }

            return newObj;
        },
        showsth() {
            const models_ = this.$refs.formBuild.getData(true)
            this.$alert(models_, '消息提示', {
                confirmButtonText: '确定',
                callback: action => {
                    this.$message({
                        type: 'info',
                        message: "提交成功后请勿重复提交"
                    });
                }
            });
        }
    },
    created() {
        const map = require('./examplejson/map.js')
        let __dirname = './examplejson/'
        let path = map.default["1-1"]
        console.log(path)
        const jsonData = require(`${__dirname + path}`);
        this.formTemplate = jsonData
    }
}
</script>

<style>
.item-main {
    position: relative;
    overflow: auto;
    overflow-x: auto;
    border: 2px solid black;
    /* 黑色边框，宽度为2px */
    border-radius: 10px;
    /* 边框的圆角半径为10px */
}

.center {
    display: flex;
    flex-direction: column;
}

.button{
    position: relative;
    top:20px;
}
</style>