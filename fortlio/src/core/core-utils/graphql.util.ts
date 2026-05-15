// import { GraphQLScalarType } from 'graphql';

// export const GraphQLJSON = new GraphQLScalarType({
//   name: 'JSON',
//   description: 'Arbitrary JSON object',
//   parseValue: (value) => value,
//   serialize: (value) => value,
//   parseLiteral: (ast) => {
//     if (ast.kind === 'StringValue' || ast.kind === 'IntValue' || ast.kind === 'FloatValue' || ast.kind === 'BooleanValue') {
//       return ast.value;
//     }
//     throw new Error(`Unsupported literal kind: ${ast.kind}`);
//   },
// });