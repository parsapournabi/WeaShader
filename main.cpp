#include <QGuiApplication>
#include <QQmlApplicationEngine>
#include <QQmlContext>

#include "SimpleQmlEngine.h"
#include "SimpleFileManager.h"

int main(int argc, char *argv[])
{
#if QT_VERSION < QT_VERSION_CHECK(6, 0, 0)
    QCoreApplication::setAttribute(Qt::AA_EnableHighDpiScaling);
#endif
    QGuiApplication app(argc, argv);

    /** PROJECT_SOURCE_DIR came from CMake definitions **/
    qDebug() << PROJECT_SOURCE_DIR;

    QString curSrcDir(PROJECT_SOURCE_DIR);
    SimpleFileManager fileMng;
    SimpleQmlEngine engine;
    const QUrl url(QUrl::fromLocalFile(curSrcDir + "main.qml"));
    QObject::connect(
        &engine,
        &QQmlApplicationEngine::objectCreated,
        &app,
        [url](QObject *obj, const QUrl &objUrl) {
            if (!obj && url == objUrl)
                QCoreApplication::exit(-1);
        },
        Qt::QueuedConnection);

    /** Setting the context properties **/
    engine.rootContext()->setContextProperty("$AppEngine", &engine);
    engine.rootContext()->setContextProperty("$FileManager", &fileMng);
    engine.rootContext()->setContextProperty("$CurrentSourceDir", curSrcDir);


    engine.load(url);

    return app.exec();
}
