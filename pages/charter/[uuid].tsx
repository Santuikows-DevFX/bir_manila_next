import { useState } from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
// mui
import Container from '@mui/material/Container';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
// components
import DefaultLayout from 'src/layouts';
import { 
    CharterFaq, 
    CharterRequirements,
    CharterProcess
} from 'src/sections/charter';
// types
// apollo
import apolloClient from 'src/graphql';
import { 
    GET_CHARTER_BY_UUID,
    GET_ALL_CHARTER,
    CitizenCharter
} from 'src/graphql/charter';

const tabList = ['FAQ', 'Requirements', 'Process'];


export default function CharterPageByUuid(props: { charter: CitizenCharter }) {
    const { charter } = props;
    const [selected, setSelected] = useState<string>('FAQ');

    const breadcrumbs = [
        { href: '/', label: 'Home' },
        { href: '/charter', label: 'Citizen Charter' },
        { 
            href: `/charter/${charter.uuid}`, 
            label: charter.title.length > 30 ? `${charter.title.slice(0, 30)}...` : charter.title 
        }
    ]

    const handleTabsChange = (event: React.SyntheticEvent, newValue: string) => {
        setSelected(newValue);
    }

    return (
        <DefaultLayout
            title={charter.title}
            breadcrumbs={breadcrumbs}
        >
            <Container sx={{ minHeight: 1000 }}>
                <Tabs
                    value={selected}
                    onChange={handleTabsChange}
                >
                    {tabList.map(tab => (
                        <Tab 
                            key={tab}
                            value={tab}
                            label={
                                <Typography variant='body1' sx={{ fontWeight: 700 }}>
                                    {tab}
                                </Typography>
                            }  
                        />
                    ))}
                </Tabs>

                {selected === "FAQ" && (
                    <CharterFaq charter={charter} handleTabsChange={tab => setSelected(tab)} />
                )}

                {selected === "Requirements" && (
                    <div>
                        <CharterRequirements requirements={charter.requirementClasses.filter(req => req.required)} />
                       {charter.requirementClasses.find(req => !req.required) && (
                            <CharterRequirements requirements={charter.requirementClasses.filter(req => !req.required)} additional />
                       )}
                    </div>
                )}

                {selected === "Process" && (
                    <CharterProcess process={charter.processList.sort((a, b) => a.step - b.step)} />
                )}
            </Container>
        </DefaultLayout>
    )
}

export const getStaticPaths: GetStaticPaths = async () => {
    const charterList = await apolloClient.query<{ findAllCharter: CitizenCharter[] }>({
        query: GET_ALL_CHARTER
    });

    return {
        paths: charterList.data.findAllCharter.map(charter => ({ 
            params: { uuid: charter.uuid }
        })),
        fallback: false
    }
}

    
export const getStaticProps: GetStaticProps = async ({ params }) => {
    
    const charter = await apolloClient.query<{ findCharterById: CitizenCharter }>({
        query: GET_CHARTER_BY_UUID,
        variables: {
            uuid: params?.uuid
        }
    }) 

    return {
        props: {
            charter: charter.data.findCharterById
        }
    }
}