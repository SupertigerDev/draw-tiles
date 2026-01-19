package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// Tile holds the schema definition for the Tile entity.
type Tile struct {
	ent.Schema
}

// Fields of the Tile.
func (Tile) Fields() []ent.Field {
	return []ent.Field{
		field.Int64("id").Unique().Immutable().StructTag(`json:"id,string"`),
		field.Int("x"),
		field.Int("y"),
		field.String("username").NotEmpty(),
	}
}

// Edges of the Tile.
func (Tile) Edges() []ent.Edge {
	return nil
}

func (Tile) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("x", "y").Unique(),
	}
}
