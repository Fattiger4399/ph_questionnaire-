<template>
    <el-container class="form-design">
        <el-header class="header" height="40px">
            <HeaderPanel :clear="clear" :preview="preview" :imp="imp" :exp="exp" :formTemplate="formTemplate"
                @importData="importData" @undo="handleUndo" @redo="handleRedo">
                <template slot="controlButton">
                    <slot name="controlButton"></slot>
                </template>
                <template slot="formName">
                    <slot name="formName"></slot>
                </template>
                <template slot="logo">
                    <slot name="logo"></slot>
                </template>
            </HeaderPanel>
        </el-header>
        <el-main class="form-main">
            <el-container class="ng-main-container">
                <el-aside width="260px" class="item-panel">
                    <slot name="drag"></slot>
                    <DragPanel :basic-item="basicItem" :decorate-item="decorateItem" :layout-item="layoutItem"
                        :application-item="applicationItem" />
                </el-aside>
                <el-main class="center-panel form-main">
                    <ContainerPanel :formTemplate="formTemplate" @handleSelectItem="handleSelectItem"
                        :selectItem="selectItem" :arrow="arrow">
                    </ContainerPanel>
                </el-main>
                <el-aside :width="arrow ? '0px' : '370px'" class="properties-panel">
                    <a :class="[arrow ? 'togglelefts ' : 'togglelefts arrowR']" @click="arrow = !arrow"
                        :style="{ right: (arrow ? '0px' : '370px') }"
                        :title="arrow ? t('ngform.open_properties_panel') : t('ngform.close_properties_panel')"></a>
                    <PropertiesPanel :selectItem="selectItem">
                        <template slot="custom-properties">
                            <slot name="custom-properties" :selectItem="selectItem"></slot>
                        </template>
                        <template slot="form-extend-properties">
                            <slot name="form-extend-properties" :data="formTemplate"></slot>
                        </template>
                        <template slot="extend-tab">
                            <slot name="extend-tab" :data="formTemplate"></slot>
                        </template>
                    </PropertiesPanel>
                </el-aside>
            </el-container>
        </el-main>
    </el-container>
</template>

<script>
import HeaderPanel from '../packages/form-design/panel-header/index.vue'
import DragPanel from '../packages/form-design/panel-drag/index.vue'
import ContainerPanel from '../packages/form-design/panel-container/index.vue'
import PropertiesPanel from '../packages/form-design/panel-properties/index.vue'
import { use } from '../locale/index'
import { getUUID } from '../utils/index'
import cloneDeep from 'lodash/cloneDeep'
import LocalMixin from '../locale/mixin.js'

function debounce(func, wait) {
    let timeout;
    return function () {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

const deepClone = (obj) => JSON.parse(JSON.stringify(obj));


export default {
    mixins: [LocalMixin],
    name: 'ng-form-design',
    components: {
        HeaderPanel,
        DragPanel,
        ContainerPanel,
        PropertiesPanel
    },
    data() {
        return {
            selectItem: {},
            arrow: false,
            i18nkey: getUUID(),
            formTemplate: this.template || {
                list: [
                ],
                config: {
                    labelPosition: 'left',
                    labelWidth: 100,
                    size: 'mini',
                    outputHidden: true, //  是否输出隐藏字段的值 默认打开,所有字段都输出
                    hideRequiredMark: false,
                    syncLabelRequired: false,
                    labelSuffix: '', // 标签后缀
                    customStyle: ''
                }
            },
            formTemplate: {},
            undoStack: [],
            redoStack: [],
            ischange: false,
            isfirst: true,
        }
    },
    props: {
        template: {
            type: Object,
            default: () => {
                return {
                    list: [],
                    config: {
                        labelPosition: 'top',
                        labelWidth: 80,
                        size: 'mini',
                        outputHidden: true, //  是否输出隐藏字段的值 默认打开,所有字段都输出
                        hideRequiredMark: false,
                        syncLabelRequired: false,
                        labelSuffix: '', // 标签后缀
                        customStyle: ''
                    }
                }
            }
        },
        customComponents: {
            type: Array,
            default: () => []
        },
        // 按钮显示隐藏
        clear: {
            type: Boolean,
            default: true
        },
        preview: {
            type: Boolean,
            default: true
        },
        imp: {
            type: Boolean,
            default: true
        },
        exp: {
            type: Boolean,
            default: true
        },
        // 外部属性配置
        config: {
            type: Object
        },
        //基础组件是否要展示或待选组件列表集合
        basicItem: {
            type: [Array, Boolean],
            default: true
        },
        //装饰组件是否要展示或待选组件列表集合
        decorateItem: {
            type: [Array, Boolean],
            default: true
        },
        //布局组件是否要展示或待选组件列表集合
        layoutItem: {
            type: [Array, Boolean],
            default: true
        },
        //应用组件是否要展示或待选组件列表集合
        applicationItem: {
            type: [Array, Boolean],
            default: true
        }
    },
    computed: {

        templateConfig() {
            if (this.formTemplate) return this.formTemplate.config
            return {}
        },
        // 配置中的http配置
        httpConfig() {
            //2023-10-11 lyf 判断是否注入了全局config
            // 优先判断内部
            if (this.config && this.config.httpConfig) {
                return this.config.httpConfig
            } else if (this.$ngofrm_httpConfig) {
                return this.$ngofrm_httpConfig
            }
            return null
        },
        // 自定义组件
        components() {
            if (this.$ngofrm_components && this.$ngofrm_components.length > 0) {
                return this.$ngofrm_components
            } else if (this.customComponents && this.customComponents.length > 0) {
                return this.customComponents
            }

            return undefined
        },
        formTemplate() {
            console.log("这是计算属性")
        }
    },
    watch: {
        formTemplate: {
            handler: function (oldVal, newVal) {
                if (!this.ischange) {
                    // debugger
                    console.log(oldVal, newVal)
                }
            },
            deep: true,
            immediate: true,
        }
    },
    provide() {
        return {
            customC: this.components,
            configC: () => this.templateConfig,
            //dictsC: this.dicts,
            httpConfigC: this.httpConfig,
            ngConfig: this.config
        }
    },
    created() {
        let jsonuserdsl = localStorage.getItem('user')
        let objectuserdsl = JSON.parse(jsonuserdsl)
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

        // this.formTemplate = realdsl

        //测试数据模板
        this.formTemplate = {
            "list": [],
            "config": {
                "labelPosition": "top",
                "labelWidth": 80,
                "size": "mini",
                "outputHidden": true,
                "hideRequiredMark": false,
                "syncLabelRequired": false,
                "labelSuffix": "",
                "customStyle": ""
            }
        }


        if (this.formTemplate == null) {
        }
        if (this.httpConfig) {
            window.nghttpConfig = this.httpConfig
        }
        // this.commandStack.push(this.formTemplate)
    },
    methods: {
        //撤销重做
        handleUndo() {
            this.ischange = true
            if (this.undoStack.length > 1) {

                let laststate = this.undoStack[this.undoStack.length - 2]
                
                this.formTemplate = deepClone(laststate)

                let redostate = this.undoStack.pop()

                this.redoStack.push(redostate)

            } else {
                alert("撤回栈已空，无法撤回")
            }
            setTimeout(() => {
                this.ischange = false
            }, 400)
        },

        handleRedo() {
            if (this.redoStack.length > 0) {
                this.formTemplate = this.redoStack.pop()
            } else {
                alert("无法重做")
            }
        },
        handleSelectItem(record) {
            // console.log(record)
            this.selectItem = record
        },

        useLocale(val) {
            use(val)
            this.i18nkey = getUUID()

            this.$ngform_bus.$emit('i18nRefresh')
        },
        // 返回编辑好的模板
        getModel() {
            const model = cloneDeep(this.formTemplate)

            return model
        },
        // 初始化模板
        initModel(formTemplate) {
            const modelData = cloneDeep(formTemplate)

            this.importData(modelData)
        },
        // 从模板处导入json表单模板
        importData(formTemplate = {}) {
            this.formTemplate.list = formTemplate.list
            for (let k in formTemplate.config) {
                this.template.config[k] = formTemplate.config[k]
            }
            //this.formTemplate.config = formTemplate.config;
        }
    }
}
</script>
<style>
.form-design {
    height: 100%;
    background: white;
    text-align: left;
}

.form-design .header {
    box-shadow: 1px 0px 6px 3px rgba(48, 65, 86, 0.35);
    background: white;
}

.form-design .form-main {
    padding: 0px;
    height: 100%;
    min-height: 500px;
}

.form-design .form-main .ng-main-container {
    height: 100%;
    min-height: 500px;
}

.form-design .item-panel {
    height: 100%;
    overflow-y: hidden;
    box-shadow: 1px 0px 6px 3px rgb(48 65 86 / 35%);
    background: white;
}

.form-design .center-panel {
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    background-color: #d5d5d5;
    padding: 0px 0px 0 0px;

}

.form-design .properties-panel {
    height: 100%;
    box-shadow: -3px 0 6px rgb(48 65 86 / 35%);
    background: white;
}
</style>
<style>
.togglelefts {
    width: 14px;
    height: 54px;
    border: solid 1px #dadada;
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
    background: #fff;
    position: absolute;
    top: 45%;
    margin-top: -27px;
    z-index: 1000;
    border-right: solid 1px #fff;
    cursor: pointer;
}

.togglelefts:before {
    content: "";
    position: absolute;
    top: 20px;
    left: 3px;
    width: 0;
    height: 0;
    border-right: 5px solid #0662ac;
    border-bottom: 5px solid transparent;
    border-top: 5px solid transparent;
}

.togglelefts:after {
    content: "";
    position: absolute;
    top: 21px;
    left: 4px;
    width: 0;
    height: 0;
    border-bottom: 4px solid transparent;
    border-right: 4px solid #fff;
    border-top: 4px solid transparent;
}

.togglelefts:hover {
    background: #d9f1ff;
}

.togglelefts:hover:before {
    border-right: 5px solid #fff;
    border-bottom: 5px solid transparent;
    border-top: 5px solid transparent;
}

.togglelefts:hover:after {
    border-bottom: 4px solid transparent;
    border-right: 4px solid #d9f1ff;
    border-top: 4px solid transparent;
}

.arrowR:before {
    content: "";
    position: absolute;
    top: 20px;
    left: 4px;
    width: 0;
    height: 0;
    border-left: 5px solid #0662ac;
    border-bottom: 5px solid transparent;
    border-top: 5px solid transparent;
    border-right: none;
    cursor: pointer;
}

.arrowR:after {
    content: "";
    position: absolute;
    top: 21px;
    left: 4px;
    width: 0;
    height: 0;
    border-bottom: 4px solid transparent;
    border-left: 4px solid #fff;
    border-top: 4px solid transparent;
    border-right: none;
    cursor: pointer;
}

.arrowR:hover:before {
    border-left: 5px solid #fff;
    border-bottom: 5px solid transparent;
    border-right: none;
    border-top: 5px solid transparent;
    cursor: pointer;
}

.arrowR:hover:after {
    border-right: none;
    border-bottom: 4px solid transparent;
    border-left: 4px solid #005eaa;
    border-top: 4px solid transparent;
    cursor: pointer;
}
</style>
<!--
  <style lang="scss">
  .form-design {
    height: 100%;
    background: white;
    .header {
      box-shadow: 1px 0px 6px 3px rgba(48, 65, 86, 0.35);
    }
  
    .form-main {
      padding: 0px;
      height: 100%;
      min-height: 500px;
  
      .ng-main-container {
        height: 100%;
        min-height: 500px;
      }
    }
  
    .item-panel {
      /* background: #f1f4f5; */
      height: 100%;
      overflow-y: hidden;
      box-shadow: 1px 0px 6px 3px rgb(48 65 86 / 35%);
    }
  
    .center-panel {
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
    }
  
    .properties-panel {
      height: 100%;
      /* background: #f1f4f5; */
      box-shadow: -3px 0 6px rgb(48 65 86 / 35%);
    }
  }
  </style>
   -->