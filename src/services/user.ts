import fs from "fs";
import path from "path";

interface User {
  telegramId: number;
  username: string;
  firstName: string;
  lastName: string;
  registeredAt: string;
  isActive: boolean;
}

const USER_DATA_PATH = path.join(__dirname, "../../data");
const USER_DATA_FILE = path.join(USER_DATA_PATH, "users.json");

if (!fs.existsSync(USER_DATA_PATH)) {
  fs.mkdirSync(USER_DATA_PATH, { recursive: true });
}

if (!fs.existsSync(USER_DATA_FILE)) {
  fs.writeFileSync(USER_DATA_FILE, JSON.stringify([], null, 2));
}

export const userService = {
  getAllUsers: (): User[] => {
    try {
      const data = fs.readFileSync(USER_DATA_FILE, "utf8");
      return JSON.parse(data) as User[];
    } catch (error) {
      console.error("Error reading user data file:", error);
      return [];
    }
  },

  saveUsers: (users: User[]): boolean => {
    try {
      fs.writeFileSync(USER_DATA_FILE, JSON.stringify(users, null, 2));
      return true;
    } catch (error) {
      console.error("Error writing user data file:", error);
      return false;
    }
  },

  registerUser: async (
    telegramId: number,
    username: string,
    firstName: string,
    lastName: string,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const users = userService.getAllUsers();

      const existingUser = users.find((user) => user.telegramId === telegramId);

      if (existingUser) {
        existingUser.username = username;
        existingUser.firstName = firstName;
        existingUser.lastName = lastName;
        existingUser.isActive = true;

        userService.saveUsers(users);

        return {
          success: true,
          message:
            "Pengguna sudah terdaftar sebelumnya. Data telah diperbarui.",
        };
      }

      const newUser: User = {
        telegramId,
        username,
        firstName,
        lastName,
        registeredAt: new Date().toISOString(),
        isActive: true,
      };

      users.push(newUser);

      const saved = userService.saveUsers(users);

      if (saved) {
        return {
          success: true,
          message: "Pengguna berhasil didaftarkan.",
        };
      } else {
        return {
          success: false,
          message: "Gagal menyimpan data pengguna.",
        };
      }
    } catch (error) {
      console.error("Error registering user:", error);
      return {
        success: false,
        message: "Terjadi kesalahan saat mendaftarkan pengguna.",
      };
    }
  },

  isUserRegistered: async (telegramId: number): Promise<boolean> => {
    try {
      const users = userService.getAllUsers();
      return users.some(
        (user) => user.telegramId === telegramId && user.isActive,
      );
    } catch (error) {
      console.error("Error checking user registration:", error);
      return false;
    }
  },

  getAllActiveUsers: async (): Promise<Array<{ telegramId: number }>> => {
    try {
      const users = userService.getAllUsers();
      return users
        .filter((user) => user.isActive)
        .map((user) => ({ telegramId: user.telegramId }));
    } catch (error) {
      console.error("Error fetching active users:", error);
      return [];
    }
  },
};
