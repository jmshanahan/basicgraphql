import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  createHttpLink,
  concat,
  gql,
} from "@apollo/client";
import { getAccessToken } from "../auth";

const jobDetailFragment = gql`
  fragment JobDetail on Job {
    id
    date
    title
    company {
      id
      name
    }
    description
  }
`;
export const companyByIdQuery = gql`
  query CompanyById($id: ID!) {
    company(id: $id) {
      id
      name
      description
      jobs {
        id
        date
        title
      }
    }
  }
`;
export const jobByIdQuery = gql`
  query JobById($id: ID!) {
    job(id: $id) {
      ...JobDetail
    }
  }
  ${jobDetailFragment}
`;

export const jobsQuery = gql`
  query Jobs {
    jobs {
      id
      date
      title
      company {
        id
        name
      }
    }
  }
`;

export const createJobMutation = gql`
  mutation createJob($input: CreateJobInput!) {
    job: createJob(input: $input) {
      ...JobDetail
    }
  }
  ${jobDetailFragment}
`;

const httpLink = createHttpLink({ uri: "http://localhost:9000/graphql" });
const authLink = new ApolloLink((operation, forward) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    operation.setContext({
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }
  console.log(`[custom] operation`, operation);
  return forward(operation);
});
export const apolloClient = new ApolloClient({
  link: concat(authLink, httpLink),
  cache: new InMemoryCache(),
});
