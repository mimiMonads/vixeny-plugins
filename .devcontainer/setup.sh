#!/bin/bash

# Download and execute the Bun installation script
echo "Installing Bun..."
curl -fsSL https://bun.sh/install | bash

# Add Bun to the PATH in .bashrc
echo "Updating PATH to include Bun..."
echo 'export PATH="$HOME/.bun/bin:$PATH"' >> ~/.bashrc

echo "Installation completed. Restart your shell or run 'source ~/.bashrc' to apply changes."
