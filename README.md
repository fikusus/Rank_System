# RankSystem for Unity

## Использование

### Установка

1. Зарегестрироватья на сайте ...
2. Создать проект приложения в кабинете иполусить GameKey
3. Скачать ranksystem.unitypackage и импортирвать его в ваш Unity проект
4. Перенести префаб RankSystem на сцену
5. Вставить GameKey в соотведсвующее поле RankSystem
6. Нажать кнопку "Test connection" для проверки праильности настройки

### Работа с плагином

- Общая информация

  Для обрабоки результатов вашего запроса используэться callback функция которая вернет
  - status(bool) - удачность оперции
  - msg(JObject) - результат запроса (при status == true) либо сообщение ошибки(при status == false);

Возможние ошибки:
- ER_EXTERNAL_ERROR
- ER_INVALID_LOGIN
- ER_NAME_IS_TAKEN
- ER_INVALID_SESSION
- ER_INVALID_GAMEKEY
- ER_INVALID_FIELDS
- Регистрация
  Для регистрации нового пользователя необходимо визвать функию Register передав в качесте параметров логин и пароль:

```cs
RankSystem.instanse.Register(RegLogin.text, RegPassword.text, (msg, status) =>
{

};
```
