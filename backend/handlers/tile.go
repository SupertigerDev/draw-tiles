package handlers

import (
	"draw-tiles-backend/ent"
	"draw-tiles-backend/services"
	"draw-tiles-backend/utils"

	"github.com/bwmarrin/snowflake"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

type TileHandler struct {
	Database    *ent.Client
	Snowflake   *snowflake.Node
	Validator   *validator.Validate
	UserService *services.UserService
	TileService *services.TileService
}

// /tiles/x,y
func (h *TileHandler) Update(c *fiber.Ctx) error {
	coords := c.Params("coords")

	x, y, err := h.TileService.ParseCoords(coords)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	psd, err := c.FormFile("psd")
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid psd file upload")
	}

	png, err := c.FormFile("png")
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid png file upload")
	}

	response, err := h.TileService.UpdateTile(x, y, psd, png)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	return utils.SendSuccess(c, response, fiber.StatusCreated)
}

func (h *TileHandler) GetPNG(c *fiber.Ctx) error {
	coords := c.Params("coords")

	x, y, err := h.TileService.ParseCoords(coords)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	return c.SendFile(h.TileService.GetTilePath(x, y))
}
