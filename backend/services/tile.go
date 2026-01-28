package services

import (
	"draw-tiles-backend/dto"
	"draw-tiles-backend/ent"
	"mime/multipart"
	"os"
	"strings"
)

type TileService struct {
	Database *ent.Client
}

func NewTileService(db *ent.Client) *TileService {
	return &TileService{
		Database: db,
	}
}

func (s *TileService) ParseCoords(coords string) (string, string, error) {
	split := strings.Split(coords, ",")
	if len(split) != 2 {
		return "", "", &CoordsError{Message: "Invalid format"}
	}
	return split[0], split[1], nil
}

func (s *TileService) UpdateTile(x, y string, psdFile, pngFile *multipart.FileHeader) (*dto.TileUpdateResponse, error) {
	// Create tiles directory if it doesn't exist
	err := os.MkdirAll("./public/tiles", 0755)
	if err != nil {
		return nil, &TileError{Message: "Failed to create tiles directory"}
	}

	// Save PSD file
	psdPath := "./public/tiles/" + x + "_" + y + ".psd"
	psdSrc, err := psdFile.Open()
	if err != nil {
		return nil, &TileError{Message: "Failed to open psd file"}
	}
	defer psdSrc.Close()

	psdDst, err := os.Create(psdPath)
	if err != nil {
		return nil, &TileError{Message: "Failed to save psd"}
	}
	defer psdDst.Close()

	_, err = psdDst.ReadFrom(psdSrc)
	if err != nil {
		return nil, &TileError{Message: "Failed to write psd"}
	}

	// Save PNG file
	pngPath := "./public/tiles/" + x + "_" + y + ".png"
	pngSrc, err := pngFile.Open()
	if err != nil {
		return nil, &TileError{Message: "Failed to open png file"}
	}
	defer pngSrc.Close()

	pngDst, err := os.Create(pngPath)
	if err != nil {
		return nil, &TileError{Message: "Failed to save png"}
	}
	defer pngDst.Close()

	_, err = pngDst.ReadFrom(pngSrc)
	if err != nil {
		return nil, &TileError{Message: "Failed to write png"}
	}

	return &dto.TileUpdateResponse{
		Png: "/tiles/" + x + "_" + y + ".png",
		Psd: "/tiles/" + x + "_" + y + ".psd",
	}, nil
}

func (s *TileService) GetTilePath(x, y string) string {
	return "./public/tiles/" + x + "_" + y + ".png"
}

// Custom error types
type CoordsError struct {
	Message string
}

func (e *CoordsError) Error() string {
	return e.Message
}

type TileError struct {
	Message string
}

func (e *TileError) Error() string {
	return e.Message
}
