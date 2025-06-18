import { Router } from "express";
import { 
    checkAdmin, 
    createAlbum, 
    createSong, 
    deleteAlbum, 
    deleteSong,
    getAllSongs,
    getAllAlbums
} from "../controller/admin.controller.js";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

// Все маршруты требуют аутентификации и прав администратора
router.use(protectRoute, requireAdmin);

// Основные маршруты
router.get("/check", checkAdmin);  // GET /api/admin/check
router.get("/songs", getAllSongs); // GET /api/admin/songs
router.post("/songs", createSong); // POST /api/admin/songs
router.delete("/songs/:id", deleteSong); // DELETE /api/admin/songs/:id
router.get("/albums", getAllAlbums); // GET /api/admin/albums
router.post("/albums", createAlbum); // POST /api/admin/albums
router.delete("/albums/:id", deleteAlbum); // DELETE /api/admin/albums/:id

router.get("/", (req, res) => {
  res.status(200).json({
    message: "Admin API is working",
    availableEndpoints: [
      "/check - Проверка прав администратора (GET)",
      "/songs - Получить все песни (GET)",
      "/songs - Добавить песню (POST)",
      "/songs/:id - Удалить песню (DELETE)",
      "/albums - Получить все альбомы (GET)",
      "/albums - Добавить альбом (POST)",
      "/albums/:id - Удалить альбом (DELETE)"
    ]
  });
});

export default router;