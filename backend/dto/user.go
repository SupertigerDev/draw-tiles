package dto

import "draw-tiles-backend/ent"

type UserResponse struct {
	ID       int64  `json:"id,string"`
	Username string `json:"username"`
}

func FilterUserResponse(u *ent.User) UserResponse {
	return UserResponse{
		ID:       u.ID,
		Username: u.Username,
	}
}

func FilterUserSliceResponse(users []*ent.User) []UserResponse {
	res := make([]UserResponse, len(users))
	for i, u := range users {
		res[i] = FilterUserResponse(u)
	}
	return res
}
