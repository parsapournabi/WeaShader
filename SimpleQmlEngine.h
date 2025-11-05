#ifndef SIMPLEQMLENGINE_H
#define SIMPLEQMLENGINE_H

#include <QQmlApplicationEngine>
#include <QDebug>

/*!
 * \brief The SimpleQmlEngine class to make clearComponentCache as Q_INVOKABLE method.
 */
class SimpleQmlEngine : public QQmlApplicationEngine {
    Q_OBJECT
public:
    Q_INVOKABLE void clearCache()
    {
        clearComponentCache();
    }
};

#endif // SIMPLEQMLENGINE_H
