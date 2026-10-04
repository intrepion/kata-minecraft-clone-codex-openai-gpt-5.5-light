# Chunk Mesh Rendering

Chunks will render through generated Chunk Meshes rather than one cube mesh per block. This adds early mesh-generation work, but avoids a known performance dead end once the Starter Valley contains real terrain.

