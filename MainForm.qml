import QtQuick 2.12
import QtQuick.Controls 2.12

Item {
    id: root

    property string effectFragment: "effect.frag"

    ShaderEffect {
        id: shEffect
        anchors.fill: parent

        property vector2d uResolution: Qt.vector2d(width, height)

        fragmentShader: $FileManager.readShader(effectFragment)
    }

}
