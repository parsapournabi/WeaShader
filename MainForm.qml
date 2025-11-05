import QtQuick 2.12
import QtQuick.Controls 2.12

Item {
    id: root

    property string effectFragment: "effect.frag"

    ShaderEffect {
        id: shEffect
        anchors.fill: parent
        fragmentShader: $FileManager.readShader(effectFragment)
    }

}
