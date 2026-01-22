package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
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
	}
}

// Edges of the Tile.
func (Tile) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("user", User.Type).
			Ref("tiles").
			Unique(),
	}
}

func (Tile) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("x", "y").Unique(),
	}
}
