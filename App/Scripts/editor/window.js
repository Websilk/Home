S.editor.window = {
    create: function (options) {
        //create a new window within the editor

        //set up window options
        var opts = {
            id: options.id ? options.id : 'new_window',
            title: options.title ? options.title : '',
            icon: options.icon ? options.icon : '',
            html: options.html ? options.html : '',
            width: options.width ? options.width : 500,
            height: options.height ? options.height : 0,
            maxWidth: options.maxWidth ? options.maxWidth : 0,
            maxHeight: options.maxHeight ? options.maxHeight : 0,
            left: options.left ? options.left : 0,
            top: options.top ? options.top : 0,
            align: options.align ? options.align : 'center', //middle, top-center, top-left, top-right, bottom-center, bottom-left, bottom-right
            alignAt: options.alignAt ? options.alignAt : 'middle', //middle, top-center, top-left, top-right, bottom-center, bottom-left, bottom-right
            alignTo: options.alignTo ? options.alignTo : 'window', //element ID, window
            canMaximize: options.canMaximize ? options.canMaximize : false,
            canClose: options.canClose ? options.canClose : true,
            canDrag: options.canDrag ? options.canDrag : true,
            isDialog: options.isDialog ? options.isDialog : false,
            hasTitleBar: options.hasTitleBar ? options.hasTitleBar : true,
            snapToEdge: options.snapToEdge ? options.snapToEdge : true
        }

        //create window element
    }


}