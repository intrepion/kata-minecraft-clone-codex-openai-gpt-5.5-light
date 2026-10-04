# Save Seed State and Edits

Local World Save will persist the world seed, player state, inventory counts, time of day, and Block Edits relative to generated chunks. Generated terrain should be reconstructed from the seed rather than serialized wholesale unless the player changed it.

