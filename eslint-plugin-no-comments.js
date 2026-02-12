function isJsxEmpty(node) {
    return (
        node.expression &&
        node.expression.type === 'JSXEmptyExpression'
    )
}

function shouldRemoveJsxCommentContainer(node) {
    return (
        isJsxEmpty(node) &&
        Array.isArray(node.expression.comments) &&
        node.expression.comments.length > 0
    )
}

/* =========================================
   REMOVE ALL COMMENTS
========================================= */

const noExplanatoryCommentsRule = {
    meta: {
        type: 'suggestion',
        fixable: 'code',
        docs: {
            description: 'Remove all comments',
        },
        messages: {
            noComment: 'CMT001 Do not commit comments',
        },
        schema: [],
    },

    create(context) {
        const source = context.getSourceCode()

        return {
            Program() {
                const comments = source.getAllComments()

                for (const comment of comments) {
                    context.report({
                        node: comment,
                        messageId: 'noComment',
                        fix: (fixer) => fixer.removeRange(comment.range),
                    })
                }
            },

            JSXExpressionContainer(node) {
                if (shouldRemoveJsxCommentContainer(node)) {
                    context.report({
                        node,
                        messageId: 'noComment',
                        fix: (fixer) => fixer.remove(node),
                    })
                }
            },
        }
    },
}

/* =========================================
   NO EMPTY BLOCKS
========================================= */

const noEmptyBlocksRule = {
    meta: {
        type: 'suggestion',
        fixable: 'code',
        messages: {
            default: 'Empty block is not allowed',
        },
        schema: [],
    },

    create(context) {
        return {
            BlockStatement(node) {
                if (node.body.length === 0) {
                    context.report({
                        node,
                        messageId: 'default',
                        fix: (fixer) => fixer.removeRange(node.range),
                    })
                }
            },
        }
    },
}

/* =========================================
   NO EMPTY JSX {}
========================================= */

const noEmptyJsxRule = {
    meta: {
        type: 'problem',
        fixable: 'code',
        messages: {
            emptyJsx: 'Empty JSX expression is not allowed',
        },
        schema: [],
    },

    create(context) {
        return {
            JSXExpressionContainer(node) {
                if (isJsxEmpty(node)) {
                    context.report({
                        node,
                        messageId: 'emptyJsx',
                        fix: (fixer) => fixer.remove(node),
                    })
                }
            },
        }
    },
}

/* ========================================= */

export default {
    rules: {
        'no-explanatory-comments': noExplanatoryCommentsRule,
        'no-empty-blocks': noEmptyBlocksRule,
        'no-empty-jsx': noEmptyJsxRule,
    },
}
