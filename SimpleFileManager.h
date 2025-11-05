#ifndef SIMPLEFILEMANAGER_H
#define SIMPLEFILEMANAGER_H

#include <QObject>
#include <QFile>
#include <QDir>
#include <QQuickItem>
#include <QDebug>

/*!
 * \brief The SimpleFileManager class to manage and reading the files contents easily.
 */
class SimpleFileManager : public QObject {
    Q_OBJECT
public:
    SimpleFileManager(QObject *parent = nullptr) : QObject{parent}{}

    Q_INVOKABLE QString readFileContent(const QString &path) const
    {
        if (!path.isEmpty()) {
            QFile f(path);
            if (f.open(QIODevice::ReadOnly | QIODevice::Text))
            {
                return f.readAll();
                f.close();
            }
        }
        return QString();
    }

    Q_INVOKABLE QString readProjectFile(const QString &fileName) const
    {
        return readFileContent(QString(PROJECT_SOURCE_DIR) + fileName);
    }

    Q_INVOKABLE QString readShader(const QString &fileName) const
    {
        return readFileContent(QDir(PROJECT_SOURCE_DIR).filePath("shaders/" + fileName));
    }


};

static void registerQmlType()
{
    qmlRegisterType<SimpleFileManager>("Tools", 1, 0, "SimpleFileManager");
}
Q_COREAPP_STARTUP_FUNCTION(registerQmlType)

#endif // SIMPLEFILEMANAGER_H
