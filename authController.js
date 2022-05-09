const User = require("./models/User");
const Role = require("./models/Role");
const bcrypt = require("bcryptjs"); //хэширование пароля
const { validationResult } = require("express-validator"); //для получения сообщений об ошибках
const jwt = require("jsonwebtoken"); //для работы с jwt
const { secret } = require("./config"); // получаем секретный ключ


//создаем функцию которая принимает ИД и роль и засовываем эт овсе в обьект пайлоад
const generateAccessToken = (id, roles) => {
  const payload = {
    id,
    roles,
  };
  return jwt.sign(payload, secret, { expiresIn: "24h" }); //передаем обьект, секретный ключ который храниться на сервере и опции
};

class authController {
  async registration(req, res) {
    try {
      //валидация
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ message: "Ошибка при регистрации", errors });
      }

      const { username, password } = req.body;
      const candidate = await User.findOne({ username }); //ищем пользователя с этим юзернеймом
      if (candidate) {
        return res.status(400).json({ message: "Пользователь уже существует" });
      }

      var hashPassword = bcrypt.hashSync(password, 7); //Хэшируем пароль

      const userRole = await Role.findOne({ value: "User" }); //присваиваем роль Юзера

      const user = new User({
        username,
        password: hashPassword,
        roles: [userRole.value],
      }); //создаем пользователя

      await user.save(); //сохраняем в БД

      return res.json({ message: "Пользователь зарегестрирован" }); //мессадж
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: "Registration Error" });
    }
  }



  async login(req, res) {
    try {
      const { username, password } = req.body; //получаем данные

      const user = await User.findOne({ username }); // ищем юзера
      if (!user) {
       return res.status(400).json({ message: "Пользователь не найден" });
      }

      const validPassword = bcrypt.compareSync(password, user.password); //валидация введенного пароля
      if (!validPassword) {
        return res.status(400).json({ message: "Пароль не верный" });
      }
      

      const token = generateAccessToken(user._id, user.roles); // _id монго генерирует сам
      return res.json({token})

    } catch (e) {
      console.log(e);
      res.status(400).json({ message: "Login Error" });
    }
  }

  

  async getUsers(req, res) {
    try {
      //todo создаем роли(один раз)
      // const userRole = new Role();
      // const adminRole = new Role({value: "ADMIN"})
      // await userRole.save();
      // await adminRole.save()

      const users = await User.find(); //получаем юзеров
      res.json(users)

    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = new authController();
