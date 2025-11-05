import QtQuick 2.12
import QtQuick.Window 2.12

Window {
    width: 640
    height: 480
    visible: true
    title: qsTr("WeaShader")

    property string mainFormPath: "MainForm.qml"

    /** Hot Reload using '`' on KeyBoard **/
    Shortcut {
        sequence: '`'
        onActivated: {
            $AppEngine.clearCache()
            appLoader.source = ""
            appLoader.source = mainFormPath
        }
    }
    Loader {
        id: appLoader
        anchors.fill: parent
        source: mainFormPath
    }

}
