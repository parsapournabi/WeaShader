import QtQuick 2.12
import QtQuick.Controls 2.12

Item {
    id: root

    property string effectFragment: "effect.frag"
    property string dreamFragment: "dream.frag"

    Image {
        id: channel0
        source: "file:///C:/Users/PARSA/Pictures/Channel0.jpg"
    }
    Image {
        id: channel1
        source: "file:///C:/Users/PARSA/Pictures/Channel1.png"
    }

    ShaderEffect {
        id: shEffect
        anchors.fill: parent

        property vector2d uResolution: Qt.vector2d(width, height)
        property real iTime: 0.0
        property variant iChannel0: channel0
        property variant iChannel1: channel1

        fragmentShader: $FileManager.readShader(dreamFragment)
    }
    Timer {
        property real _st: Date.now() // Start Time
        running: true
        repeat: true
        interval: 16
        onTriggered: {
            shEffect.iTime = (Date.now() - _st) * 0.001
        }
    }

}
