<template>
    <div>
        <div class="container">
            <div class="item-main">
                <!-- <FormBuild :key="key" :preview="preview" :formTemplate="formTemplate" :models="models" :config="ngConfig"
                ref="formBuild" :customComponents="customComponents" /> -->
                <FormBuild :key="key" :preview="preview" :formTemplate="formTemplate" :models="models"
                    :config="ngConfig" ref="formBuild" :customComponents="customComponents" />
            </div>
            <div class="item-textarea">
                <el-input type="textarea" rows="8" style="width:400px;overflow: auto;" readonly :value="dataJson">
                </el-input>
                <div class="button_box">
                    <div class="button_1">
                        <el-button type="primary" size="mini" @click="handleGetData">获取数据</el-button>
                    </div>
                    <div class="button_2">
                        <el-button type="primary" size="mini" @click="handleTopreview">进入发布页面</el-button>
                    </div>
                </div>
                <div class="publish_url">

                    <div style="margin-top: 15px;">
                        <el-input placeholder="请输入内容" v-model="input_1" >
                            <template slot="append">
                                <el-button @click="handleTopreview">跳转</el-button>
                            </template>
                        </el-input>
                    </div>
                </div>
                <div class="item-erweima">
                    <div id="qrcode" ref="qrCodeDiv"></div>
                </div>
            </div>
        </div>
        <el-dialog :title="t('ngform.header.get_data')" :visible.sync="dataVisible" style="top:20px;"
            :append-to-body="true" class="data-preview" :close-on-click-modal="false" :destroy-on-close="true"
            width="600px">
            <div class="json-box">
                <el-input style="min-height:300px;height: 300px;max-height: 290px;overflow: auto;" autosize readonly
                    ref="dataJson" type="textarea" :value="dataJson">
                </el-input>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import FormBuild from '../packages/form-design/build.vue'
import LocalMixin from '../locale/mixin.js'
import QRCode from "qrcodejs2";
export default {
    mixins: [LocalMixin],
    components: {
        FormBuild
    },
    data() {
        return {
            visible: false,
            renderVisisble: false,
            previewWidth: 850,
            models: {},
            formTemplate: {},
            key: '1',

            preview: false,

            dataVisible: false,
            dataJson: '',
            publish_url: 'http://120.79.210.248//#/publish',
            input_1: ""
        };
    },
    created() {
        let jsonuserdsl = localStorage.getItem('user')
        let objectuserdsl = JSON.parse(jsonuserdsl)
        console.log(objectuserdsl)
        let realdsl = {
            list: []
        }
        // 遍历对象的键，这些键代表了数组索引
        for (let key in objectuserdsl.list) {
            // 使用对象的值（这里是一个对象）来构造数组元素
            const arrayItem = objectuserdsl.list[key];
            // 将对象转换为数组元素，并添加到结果数组中
            realdsl.list.push(arrayItem);
        }
        console.log(realdsl)
        // realdsl = {
        //     ...list,
        //     config: objectuserdsl.config
        // }
        realdsl.config = objectuserdsl.config

        this.formTemplate = realdsl

        this.bindQRCode();

    },
    computed: {
        module_json() {
            // JSON.parse(this.models)
            let data = cloneDeep(this.models)
            return data
        }
    },
    methods: {

        handleGetData() {
            const models_ = this.$refs.formBuild.getData(true)

            this.dataJson = JSON.stringify(models_, null, "\t")

            // this.dataVisible = true
        },
        handleTopreview() {
            this.$router.push("preview")
        },
        //生成二维码
        bindQRCode(url) {
            new QRCode(this.$refs.qrCodeDiv, {
                text: url,
                width: 200,
                height: 200,
                colorDark: "#333333", //二维码颜色
                colorLight: "#ffffff", //二维码背景色
                correctLevel: QRCode.CorrectLevel.L//容错率，L/M/H
            })
        },

    },
    mounted() {
        // this.$nextTick(function () {

        this.bindQRCode(this.publish_url);
        this.input_1 = this.publish_url;

        // })
    },

}
</script>

<style>
.container {
    display: flex;
    justify-content: center;
    height: 98vh;
    /* 100% 视口高度 */
    width: auto;

    overflow: auto;

}

.item-main {
    width: 600px;
    border: 30px;
    margin: 10px;
}

.button_box {
    display: flex;
}

.button_1 {
    width: auto;
    margin: 10px 10px 10px 1px;
}

.button_2 {
    width: auto;
    margin: 10px;
}

.publish_url {
    margin: 0px 0px 20px
}

.item-textarea {
    display: flex;
    width: auto;
    flex-direction: column;
    margin: 10px;
}

.item-erweima {
    width: 200px;
    border: 2px solid black;
    /* 黑色边框，宽度为2px */
    border-radius: 10px;
    /* 边框的圆角半径为10px */
}
</style>