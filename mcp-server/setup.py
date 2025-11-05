"""
Obsidian Cursor Logger MCP Server
为 Obsidian 插件开发者提供日志收集和 Auto-Reload 管理服务
"""

import os
from setuptools import setup, find_packages

with open("requirements.txt") as f:
    requirements = f.read().splitlines()

setup(
    name="obsidian-logger-mcp",
    version="1.0.0",
    description="MCP Server for Obsidian Logger",
    long_description=open("README.md", encoding="utf-8").read() if os.path.exists("README.md") else "",
    long_description_content_type="text/markdown",
    author="LINYF510",
    author_email="",
    url="https://github.com/LINYF510/obsidian-cursor-logger",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    install_requires=requirements,
    python_requires=">=3.10",
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
    ],
    entry_points={
        "console_scripts": [
            "obsidian-logger-mcp=mcp_obsidian_logger:main",
        ],
    },
)

