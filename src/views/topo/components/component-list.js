// 公共样式
export const commonStyle = {
    rotate: 0,
    opacity: 1
}

// 编辑器左侧组件列表
const list = [{
    type: 'NetworkDevice',
    label: '网络设备',
    children: [{
        nodeType: 'Switch',
        label: '交换机',
        icon: require('@/assets/images/topo/Switch.png'),
        width: 45,
        height: 45,
    }]
},
{
    type: 'Computer',
    label: '计算机设备',
    children: [{
        nodeType: 'PC',
        label: 'PC电脑',
        icon: require('@/assets/images/topo/PC.png'),
        width: 45,
        height: 45,
    },
    {
        nodeType: 'PAD',
        label: '平板电脑',
        icon: require('@/assets/images/topo/PAD.png'),
        width: 45,
        height: 45,
    }
    ]
}, {
    type: 'Displays',
    label: '显示设备',
    children: [{
        nodeType: 'PinJie',
        label: '拼接屏',
        icon: require('@/assets/images/topo/PinJie.png'),
        width: 45,
        height: 45,
    },
    {
        nodeType: 'LED',
        label: 'LED大屏',
        icon: require('@/assets/images/topo/LED.png'),
        width: 45,
        height: 45,
    },
    {
        nodeType: 'Projector',
        label: '投影仪',
        icon: require('@/assets/images/topo/Projector.png'),
        width: 45,
        height: 45,
    }
    ]
},
{
    type: 'Monitor',
    label: '监控设备',
    children: [{
        nodeType: 'Camera',
        label: '摄像头',
        icon: require('@/assets/images/topo/Camera.png'),
        width: 45,
        height: 45,
    },
    {
        nodeType: 'NetworkCamera',
        label: '网络摄像头',
        icon: require('@/assets/images/topo/NetworkCamera.png'),
        width: 45,
        height: 45,
    }
    ]
}
]

for (let i = 0, len = list.length; i < len; i++) {
    const item = list[i]
    item.style = { ...commonStyle, ...item.style }
}

export default list