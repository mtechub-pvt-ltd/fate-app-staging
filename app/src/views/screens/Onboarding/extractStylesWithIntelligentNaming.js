const fs = require("fs");
const path = require("path");
const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;

function extractStylesFromFile(filePath) {
    const fileContent = fs.readFileSync(filePath, "utf-8");

    // Step 1: Parse the file's content into an AST
    const ast = parse(fileContent, {
        sourceType: "module",
        plugins: ["jsx", "flow"],
    });

    const styles = [];
    const updatedContent = fileContent;

    traverse(ast, {
        ObjectExpression(path) {
            const parentNode = path.parentPath.node;
            if (
                parentNode.type === "JSXAttribute" &&
                parentNode.name.name === "style"
            ) {
                const styleObject = path.node;

                // Generate a unique and intelligent style name based on its context
                const styleName = generateStyleName(parentNode);

                styles.push({
                    styleName,
                    styleObject,
                });

                // Replace the inline style with a reference to the extracted style
                parentNode.value = {
                    type: "JSXExpressionContainer",
                    expression: {
                        type: "MemberExpression",
                        object: { type: "Identifier", name: "styles" },
                        property: { type: "Identifier", name: styleName },
                    },
                };
            }
        },
    });

    // Step 4: Append the extracted styles to the end of the file
    const extractedStyles = styles
        .map(({ styleName, styleObject }) => {
            return `${styleName}: ${JSON.stringify(styleObject, null, 2)},`;
        })
        .join("\n");

    const finalStyles = `const styles = StyleSheet.create({\n${extractedStyles}\n});`;
    const output = `${updatedContent}\n\n${finalStyles}`;

    // Write the updated content back to the file
    fs.writeFileSync(filePath, output, "utf-8");
    console.log(`Styles extracted and updated in: ${filePath}`);
}

function generateStyleName(node) {
    if (node.type === "JSXAttribute" && node.name.name === "style") {
        const parentTag = node.parent.name.name || "View";
        return `styleFor${parentTag}`;
    }
    return `style${Date.now()}`; // Fallback unique name
}

function resolveReferences(styleText) {
    if (/COLORS|fonts|Images/.test(styleText)) {
        return styleText; // Leave references unchanged
    }
    return styleText;
}

// Provide the path to the file you want to process
const filePath = path.resolve(
    __dirname,
    "./Test.js"
);
extractStylesFromFile(filePath);
