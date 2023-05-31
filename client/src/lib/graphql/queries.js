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

const jobByIdquery = gql`
  query JobById($id: ID!) {
    job(id: $id) {
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
const apolloClient = new ApolloClient({
  link: concat(authLink, httpLink),
  cache: new InMemoryCache(),
});

export async function createJob({ title, description }) {
  const mutation = gql`
    mutation createJob($input: CreateJobInput!) {
      job: createJob(input: $input) {
        ...JobDetail
      }
    }
    ${jobDetailFragment}
  `;
  const {
    data: { job },
  } = await apolloClient.mutate({
    mutation,
    variables: { input: { title, description } },
    update: (cache, { data }) => {
      cache.writeQuery({
        query: jobByIdquery,
        variables: {
          id: data.job.id,
        },
        data,
      });
    },
  });
  return job;
}

export async function getCompany(id) {
  const query = gql`
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
  // const { company } = await client.request(query, { id });
  // return company;
  const {
    data: { company },
  } = await apolloClient.query({ query, variables: { id } });
  console.log(company);
  return company;
}

export async function getJob(id) {
  // const { job } = await client.request(query, { id });
  const {
    data: { job },
  } = await apolloClient.query({ query: jobByIdquery, variables: { id } });
  console.log(job);
  return job;
}

export async function getJobs() {
  const query = gql`
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
  // const { jobs } = await client.request(query);
  const { data } = await apolloClient.query({
    query,
    fetchPolicy: "network-only",
  });
  return data.jobs;
}
