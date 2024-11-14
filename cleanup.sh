#!/bin/bash

# Remove redundant files
echo "Removing redundant files..."

# Remove duplicate error handling files
rm -f src/utils/contractErrors.js

# Remove unnecessary index files
rm -f src/components/game/index.js
rm -f src/components/layout/index.js
rm -f src/components/common/index.js

# Remove consolidated network config
rm -f src/config/networks.js

# Remove admin hook (functionality moved)
rm -f src/hooks/useAdmin.js

# Remove format utils (consolidated into helpers)
rm -f src/utils/format.js

# Optional: Remove empty directories
find src -type d -empty -delete

echo "Cleanup complete!" 