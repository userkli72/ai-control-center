import "dotenv/config";

import http from "http";

import {
    getAgent,
    getAvailableAgents
} from "./agents/registry";

const PORT = 3001;

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "http://localhost:5173",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
};

const server = http.createServer(async (req, res) => {

    // ----------------------------------------------------
    // CORS PREFLIGHT
    // ----------------------------------------------------

    if (req.method === "OPTIONS") {

        res.writeHead(204, CORS_HEADERS);

        res.end();

        return;
    }


    // ----------------------------------------------------
    // GET /api/agents
    // ----------------------------------------------------

    if (
        req.method === "GET" &&
        req.url === "/api/agents"
    ) {

        const agents = getAvailableAgents().map(agent => ({
            id: agent.id,
            name: agent.name
        }));

        res.writeHead(200, {
            ...CORS_HEADERS,
            "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
            agents
        }));

        return;
    }


    // ----------------------------------------------------
    // POST /api/agents
    // ----------------------------------------------------

    if (
        req.method === "POST" &&
        req.url === "/api/agents"
    ) {

        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", async () => {

            try {

                const data = JSON.parse(body);

                const question = data.question;

                const agentSelections = data.agents;


                // ------------------------------------------------
                // VALIDATE QUESTION
                // ------------------------------------------------

                if (
                    !question ||
                    typeof question !== "string"
                ) {

                    res.writeHead(400, {
                        ...CORS_HEADERS,
                        "Content-Type": "application/json"
                    });

                    res.end(JSON.stringify({
                        error: "Question is required."
                    }));

                    return;
                }


                // ------------------------------------------------
                // VALIDATE AGENTS
                // ------------------------------------------------

                if (
                    !Array.isArray(agentSelections) ||
                    agentSelections.length === 0
                ) {

                    res.writeHead(400, {
                        ...CORS_HEADERS,
                        "Content-Type": "application/json"
                    });

                    res.end(JSON.stringify({
                        error: "At least one agent is required."
                    }));

                    return;
                }


                // ------------------------------------------------
                // RUN SELECTED AGENTS
                // ------------------------------------------------

                const promises = agentSelections.map(
                    async (selection: unknown) => {

                        /*
                        --------------------------------------------
                        OLD FORMAT

                        "chatgpt"

                        NEW FORMAT

                        {
                            id: "chatgpt",
                            model: "gpt-6-astra"
                        }
                        --------------------------------------------
                        */

                        let agentId: string;

                        let model:
                            | string
                            | undefined;


                        if (
                            typeof selection === "string"
                        ) {

                            agentId = selection;

                        } else if (
                            typeof selection === "object" &&
                            selection !== null &&
                            "id" in selection
                        ) {

                            const item =
                                selection as {
                                    id?: unknown;
                                    model?: unknown;
                                };


                            if (
                                typeof item.id !== "string"
                            ) {

                                return {
                                    agent: "unknown",
                                    response: "",
                                    elapsedMs: 0,
                                    real: false,
                                    error:
                                        "Invalid agent selection."
                                };
                            }


                            agentId = item.id;


                            if (
                                typeof item.model === "string"
                            ) {

                                model = item.model;
                            }

                        } else {

                            return {
                                agent: "unknown",
                                response: "",
                                elapsedMs: 0,
                                real: false,
                                error:
                                    "Invalid agent selection."
                            };
                        }


                        // ------------------------------------------------
                        // FIND AGENT
                        // ------------------------------------------------

                        const agent =
                            getAgent(agentId);


                        if (!agent) {

                            return {
                                agent: agentId,
                                response: "",
                                elapsedMs: 0,
                                real: false,
                                error:
                                    "Agent is not available."
                            };
                        }


                        // ------------------------------------------------
                        // RUN AGENT + SELECTED MODEL
                        // ------------------------------------------------

                        return agent.run(
                            question,
                            model
                        );
                    }
                );


                const responses =
                    await Promise.all(promises);


                // ------------------------------------------------
                // RETURN RESULTS
                // ------------------------------------------------

                res.writeHead(200, {
                    ...CORS_HEADERS,
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    question,
                    responses
                }));

            } catch (error) {

                console.error(
                    "Agent request error:",
                    error
                );

                res.writeHead(500, {
                    ...CORS_HEADERS,
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    error:
                        "Agent request failed."
                }));
            }
        });

        return;
    }


    // ----------------------------------------------------
    // 404
    // ----------------------------------------------------

    res.writeHead(404, {
        ...CORS_HEADERS,
        "Content-Type": "application/json"
    });

    res.end(JSON.stringify({
        error: "Not found."
    }));
});


server.listen(PORT, () => {

    console.log("");
    console.log("AI Control Center backend");
    console.log("-------------------------");

    console.log(
        `Agent API: http://localhost:${PORT}/api/agents`
    );

    console.log("");
});