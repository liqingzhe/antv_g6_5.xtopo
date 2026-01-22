var JtopoEditor = {
    // 拓扑图预览 打开新的空白页面
    showPic(stage) {
        stage.saveImageInfo()
    },
    downloadImg(stage) {
        var a = document.createElement('a');
        a.href = stage.getImageInfo(); //下载图片
        a.download = '拓扑图.png';
        a.click();
    },
    convertCanvasToImage: function (canvas) {
        var image = new Image();
        image.src = canvas.toDataURL("image/png");
        return image;
    },
    // 全屏显示
    showInFullScreen(element, method) {
        let usablePrefixMethod;
        ['webkit', 'moz', 'ms', 'o', ''].forEach(function (prefix) {
            if (usablePrefixMethod) {
                return
            }
            if (prefix === '') {
                // 无前缀，方法首字母小写
                // method = method.slice(0, 1).toLowerCase() + method.slice(1)
            }
            let typePrefixMethod = typeof element[prefix + method]
            if (typePrefixMethod + '' !== 'undefined') {
                if (typePrefixMethod === 'function') {
                    usablePrefixMethod = element[prefix + method]()
                } else {
                    usablePrefixMethod = element[prefix + method]
                }
            }
        }
        )
        return usablePrefixMethod
    },
    // 居中显示
    showInCenter: function (stage) {
        stage.centerAndZoom()
    },
    findNodes(scene, text) {
        return scene.findElements((node) => {
            let value = node.text.trim();
            return value.includes(text)
        })
    }
}
export default JtopoEditor