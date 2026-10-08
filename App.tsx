import { useState } from "react";
import "./App.css";

import {
    parseCommand
} from "./commandParser";


// ============================================================
// TYPES
// ============================================================

type Agent = {
    id: string;
    name: string;
    groupId: string;
    providerId: string;
    model: string;
    online: boolean;
    cost: string;
};

type AgentGroup = {
    id: string;
    name: string;
    agents: string[];
};

type ConversationSummary = {
    id: string;
    date: string;
    time: string;
    topic: string;
    summary: string;
    agents: string[];
};


// ============================================================
// GLOBAL AGENT REGISTRY
// ============================================================
// A# is permanent and globally unique.
// Agent numbering does NOT restart in another group.
// ============================================================

const agents: Agent[] = [

    // --------------------------------------------------------
    // G1 · GENERAL
    // --------------------------------------------------------

    {
        id: "a1",
        name: "ChatGPT",
        groupId: "g1",
        providerId: "chatgpt",
        model: "gpt-6-astra",
        online: true,
        cost: "medium"
    },

    {
        id: "a2",
        name: "Claude",
        groupId: "g1",
        providerId: "claude",
        model: "claude",
        online: false,
        cost: "medium"
    },

    {
        id: "a3",
        name: "Gemini",
        groupId: "g1",
        providerId: "gemini",
        model: "gemini-3.8-flash",
        online: true,
        cost: "low"
    },

    {
        id: "a4",
        name: "Copilot",
        groupId: "g1",
        providerId: "copilot",
        model: "copilot",
        online: false,
        cost: "medium"
    },

    {
        id: "a5",
        name: "Grok",
        groupId: "g1",
        providerId: "grok",
        model: "grok",
        online: false,
        cost: "medium"
    },


    // --------------------------------------------------------
    // G2 · CODING
    // --------------------------------------------------------

    {
        id: "a6",
        name: "Codex",
        groupId: "g2",
        providerId: "codex",
        model: "codex",
        online: false,
        cost: "low"
    },

    {
        id: "a7",
        name: "Claude Code",
        groupId: "g2",
        providerId: "claude-code",
        model: "claude-code",
        online: false,
        cost: "medium"
    },

    {
        id: "a8",
        name: "GitHub Copilot",
        groupId: "g2",
        providerId: "github-copilot",
        model: "copilot",
        online: false,
        cost: "low"
    },

    {
        id: "a9",
        name: "Cursor",
        groupId: "g2",
        providerId: "cursor",
        model: "cursor",
        online: false,
        cost: "medium"
    },

    {
        id: "a10",
        name: "Windsurf",
        groupId: "g2",
        providerId: "windsurf",
        model: "windsurf",
        online: false,
        cost: "medium"
    }
];

const [
    conversationsOpen,
    setConversationsOpen
] = useState(true);


const [
    conversations,
    setConversations
] = useState<ConversationSummary[]>([]);


// ============================================================
// GROUPS
// ============================================================

const groups: AgentGroup[] = [

    {
        id: "g1",
        name: "GENERAL",
        agents: [
            "a1",
            "a2",
            "a3",
            "a4",
            "a5"
        ]
    },

    {
        id: "g2",
        name: "CODING",
        agents: [
            "a6",
            "a7",
            "a8",
            "a9",
            "a10"
        ]
    }
];


// ============================================================
// COMMAND PARSER GROUP MAP
// ============================================================

const groupMap: Record<string, string[]> = {

    g1: [
        "a1",
        "a2",
        "a3",
        "a4",
        "a5"
    ],

    g2: [
        "a6",
        "a7",
        "a8",
        "a9",
        "a10"
    ]
};


// ============================================================
// APP
// ============================================================

function App() {

    const [
        selectedAgents,
        setSelectedAgents
    ] = useState<string[]>([
        "a1",
        "a2",
        "a3"
    ]);


    const [
        prompt,
        setPrompt
    ] = useState("");


    const [
        responses,
        setResponses
    ] = useState<Record<string, string>>({});


    const [
        groupsOpen,
        setGroupsOpen
    ] = useState<Record<string, boolean>>({
        g1: true,
        g2: true
    });


    const [
        sidebarOpen,
        setSidebarOpen
    ] = useState(true);


    // ========================================================
    // FIND AGENT
    // ========================================================

    function getAgent(
        id: string
    ) {

        return agents.find(
            agent =>
                agent.id === id
        );
    }


    // ========================================================
    // TOGGLE AGENT
    // ========================================================

    function toggleAgent(
        id: string
    ) {

        setSelectedAgents(
            current => {

                if (
                    current.includes(id)
                ) {

                    return current.filter(
                        agentId =>
                            agentId !== id
                    );
                }

                return [
                    ...current,
                    id
                ];
            }
        );
    }


    // ========================================================
    // TOGGLE GROUP OPEN/CLOSED
    // ========================================================

    function toggleGroupOpen(
        id: string
    ) {

        setGroupsOpen(
            current => ({

                ...current,

                [id]:
                    !current[id]

            })
        );
    }


    // ========================================================
    // SELECT / DESELECT GROUP
    // ========================================================

    function toggleGroupSelection(
        group: AgentGroup
    ) {

        const allSelected =
            group.agents.every(
                id =>
                    selectedAgents.includes(id)
            );


        setSelectedAgents(
            current => {

                if (allSelected) {

                    return current.filter(
                        id =>
                            !group.agents.includes(id)
                    );
                }


                const result = [
                    ...current
                ];


                for (
                    const id of group.agents
                ) {

                    if (
                        !result.includes(id)
                    ) {

                        result.push(id);
                    }
                }


                return result;
            }
        );
    }
	
	// ========================================================
	// CONVERSATION PANE
	// ========================================================

	function renderConversationPane() {

		return (

			<aside
				className={
					conversationsOpen
						? "conversation-pane"
						: "conversation-pane collapsed"
				}
			>

				<div className="conversation-header">

					{conversationsOpen && (

						<span>
							CONVERSATIONS
						</span>

					)}

					<button
						className="conversation-toggle"
						onClick={() =>
							setConversationsOpen(
								current =>
									!current
							)
						}
					>

						{
							conversationsOpen
								? "›"
								: "‹"
						}

					</button>

				</div>


				{conversationsOpen && (

					<div className="conversation-list">

						{
							conversations.length === 0
								? (

									<div className="conversation-empty">

										No conversations yet.

										<br />
										<br />

										Conversations will
										appear here as history
										is created.

									</div>

								)
								: (

									conversations.map(
										conversation => (

											<div
												className="conversation-card"
												key={
													conversation.id
												}
											>

												<div className="conversation-date">

													{
														conversation.date
													}

													{" · "}

													{
														conversation.time
													}

												</div>


												<div className="conversation-id">

													{
														conversation.id
													}

												</div>


												<div className="conversation-topic">

													{
														conversation.topic
													}

												</div>


												<div className="conversation-summary">

													{
														conversation.summary
													}

												</div>


												<div className="conversation-agents">

													{
														conversation.agents
															.map(
																id =>
																	id.toUpperCase()
															)
															.join(
																" · "
															)
													}

												</div>

											</div>

										)
									)

								)

						}

					</div>

				)}

			</aside>

		);
	}


    // ========================================================
    // RUN COMMAND
    // ========================================================

    async function runAgents() {

        const parsed =
            parseCommand(
                prompt,
                groupMap
            );


        // ----------------------------------------------------
        // INVALID COMMAND
        // ----------------------------------------------------

        if (!parsed) {

            alert(
                "Invalid command.\n\n" +
                "Example:\n" +
                "/ask a1,a3\n" +
                "what is an electronic circuit"
            );

            return;
        }


        // ----------------------------------------------------
        // DEBUG
        // ----------------------------------------------------

        console.log(
            "COMMAND:",
            parsed.command
        );

        console.log(
            "TARGETS:",
            parsed.targets
        );

        console.log(
            "MESSAGE:",
            parsed.message
        );


		// ----------------------------------------------------
		// UI REPLACEMENT
		// ----------------------------------------------------

		if (
			parsed.command === "ui-replace"
		) {

			setSelectedAgents(
				parsed.targets
			);

			console.log(
				"UI REPLACED WITH:",
				parsed.targets
			);

			return;
		}


		// ----------------------------------------------------
		// UPDATE SELECTION FOR OTHER COMMANDS
		// ----------------------------------------------------

		if (
			parsed.targets.length > 0
		) {

			setSelectedAgents(
				parsed.targets
			);
		}


		// ----------------------------------------------------
		// COMMANDS NOT CONNECTED TO BACKEND YET
		// ----------------------------------------------------

		if (
			parsed.command !== "ask"
		) {

			console.log(
				"PARSED COMMAND:",
				parsed
			);

			alert(
				`/${parsed.command} parsed successfully.`
			);

			return;
		}


        // ----------------------------------------------------
        // BUILD BACKEND AGENT LIST
        // ----------------------------------------------------

        const backendAgents =
            parsed.targets
                .map(
                    id =>
                        getAgent(id)
                )
                .filter(
                    (
                        agent
                    ): agent is Agent =>
                        agent !== undefined &&
                        agent.online
                )
                .map(
                    agent => ({

                        id:
                            agent.providerId,

                        model:
                            agent.model

                    })
                );


        // ----------------------------------------------------
        // NO ONLINE AGENTS
        // ----------------------------------------------------

        if (
            backendAgents.length === 0
        ) {

            alert(
                "None of the selected agents are currently online."
            );

            return;
        }


        // ----------------------------------------------------
        // SHOW WAITING STATE
        // ----------------------------------------------------

        const waitingResponses:
            Record<string, string> = {};


        for (
            const id of parsed.targets
        ) {

            const agent =
                getAgent(id);


            if (
                agent &&
                agent.online
            ) {

                waitingResponses[id] =
                    "Waiting for response...";
            }
        }


        // ----------------------------------------------------
        // MERGE WAITING STATE
        // ----------------------------------------------------
        // Preserve responses from previous requests.
        // Only the currently requested agents are changed.

        setResponses(
            current => ({

                ...current,

                ...waitingResponses

            })
        );


        // ----------------------------------------------------
        // CALL BACKEND
        // ----------------------------------------------------

        try {

            const response =
                await fetch(
                    "http://localhost:3001/api/agents",
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                agents:
                                    backendAgents,

                                question:
                                    parsed.message

                            })

                    }
                );


            // ------------------------------------------------
            // HTTP ERROR
            // ------------------------------------------------

            if (
                !response.ok
            ) {

                const errorText =
                    await response.text();

                throw new Error(
                    errorText ||
                    `HTTP ${response.status}`
                );
            }


            // ------------------------------------------------
            // READ BACKEND RESPONSE
            // ------------------------------------------------

            const data =
                await response.json();


            console.log(
                "BACKEND RESPONSE:",
                data
            );


            // ------------------------------------------------
            // MAP RESPONSES TO GLOBAL A# IDs
            // ------------------------------------------------

            const finalResponses:
                Record<string, string> = {};


            if (
                Array.isArray(
                    data.responses
                )
            ) {

                for (
                    const result
                    of data.responses
                ) {

                    const backendAgent =
                        String(
                            result.agent ||
                            ""
                        )
                            .trim()
                            .toLowerCase();


                    const agent =
                        agents.find(
                            item => {

                                return (
                                    item.providerId
                                        .toLowerCase() ===
                                    backendAgent ||

                                    item.name
                                        .toLowerCase() ===
                                    backendAgent
                                );
                            }
                        );


                    if (
                        agent
                    ) {

                        finalResponses[
                            agent.id
                        ] =
                            result.response ||
                            "No response returned.";
                    }
                }
            }


            // ------------------------------------------------
            // FALLBACK
            // ------------------------------------------------

            if (
                Object.keys(
                    finalResponses
                ).length === 0
            ) {

                console.log(
                    "Unexpected backend response:",
                    data
                );


                for (
                    const id of parsed.targets
                ) {

                    const agent =
                        getAgent(id);


                    if (
                        agent &&
                        agent.online
                    ) {

                        finalResponses[id] =
                            JSON.stringify(
                                data,
                                null,
                                2
                            );
                    }
                }
            }


            // ------------------------------------------------
            // MERGE FINAL RESPONSES
            // ------------------------------------------------
            // Preserve all previous agent responses.
            // Only agents in this request are updated.

            setResponses(
                current => ({

                    ...current,

                    ...finalResponses

                })
            );


        } catch (
            error
        ) {

            console.error(
                "Agent request failed:",
                error
            );


            const errorResponses:
                Record<string, string> = {};


            for (
                const id of parsed.targets
            ) {

                const agent =
                    getAgent(id);


                if (
                    agent &&
                    agent.online
                ) {

                    errorResponses[id] =
                        `ERROR: ${
                            error instanceof Error
                                ? error.message
                                : String(error)
                        }`;
                }
            }


            // ------------------------------------------------
            // MERGE ERROR RESPONSES
            // ------------------------------------------------
            // Preserve previous responses from other agents.

            setResponses(
                current => ({

                    ...current,

                    ...errorResponses

                })
            );
        }
    }


    // ========================================================
    // RENDER AGENT
    // ========================================================

    function renderAgent(
        agent: Agent
    ) {

        const selected =
            selectedAgents.includes(
                agent.id
            );


        return (

            <div
                key={agent.id}
                className={
                    selected
                        ? "agent-column selected"
                        : "agent-column"
                }
            >

                <button
                    className="agent-button"
                    onClick={() =>
                        toggleAgent(
                            agent.id
                        )
                    }
                >

                    <div className="agent-id">
                        {agent.id.toUpperCase()}
                    </div>


                    <div className="agent-name">
                        {agent.name}
                    </div>


                    <div className="agent-indicators">

                        <span
                            className={
                                agent.online
                                    ? "status-light online"
                                    : "status-light offline"
                            }
                            title={
                                agent.online
                                    ? "Online"
                                    : "Offline"
                            }
                        />


                        <span
                            className={
                                selected
                                    ? "select-light selected-light"
                                    : "select-light"
                            }
                            title={
                                selected
                                    ? "Selected"
                                    : "Not selected"
                            }
                        />

                    </div>

                </button>


                <div className="agent-answer">

                    <div className="answer-title">

                        {agent.id.toUpperCase()}
                        {" · "}
                        {agent.name}

                    </div>


                    <div className="answer-content">

                        {
                            responses[agent.id]
                                ? responses[agent.id]
                                : "No response yet"
                        }

                    </div>

                </div>

            </div>
        );
    }


    // ========================================================
    // SIDEBAR
    // ========================================================

    function renderSidebar() {

        return (

            <aside
                className={
                    sidebarOpen
                        ? "sidebar"
                        : "sidebar collapsed"
                }
            >

                <div className="sidebar-header">

                    {sidebarOpen && (

                        <span>
                            AI AGENT GROUPS
                        </span>

                    )}


                    <button
                        className="sidebar-toggle"
                        onClick={() =>
                            setSidebarOpen(
                                current =>
                                    !current
                            )
                        }
                    >

                        {
                            sidebarOpen
                                ? "‹"
                                : "›"
                        }

                    </button>

                </div>


                {sidebarOpen && (

                    <div className="groups">

                        {groups.map(
                            group => {

                                const groupSelected =
                                    group.agents.every(
                                        id =>
                                            selectedAgents.includes(
                                                id
                                            )
                                    );


                                return (

                                    <div
                                        className="group"
                                        key={group.id}
                                    >

                                        <div className="group-header">

                                            <button
                                                className="group-arrow"
                                                onClick={() =>
                                                    toggleGroupOpen(
                                                        group.id
                                                    )
                                                }
                                            >

                                                {
                                                    groupsOpen[
                                                        group.id
                                                    ]
                                                        ? "▼"
                                                        : "▶"
                                                }

                                            </button>


                                            <button
                                                className={
                                                    groupSelected
                                                        ? "group-name group-selected"
                                                        : "group-name"
                                                }
                                                onClick={() =>
                                                    toggleGroupSelection(
                                                        group
                                                    )
                                                }
                                            >

                                                {
                                                    group.id.toUpperCase()
                                                }

                                                {" · "}

                                                {
                                                    group.name
                                                }

                                            </button>

                                        </div>


                                        {groupsOpen[
                                            group.id
                                        ] && (

                                            <div className="group-agents">

                                                {group.agents.map(
                                                    id => {

                                                        const agent =
                                                            getAgent(
                                                                id
                                                            );


                                                        if (!agent) {
                                                            return null;
                                                        }


                                                        const selected =
                                                            selectedAgents.includes(
                                                                agent.id
                                                            );


                                                        return (

                                                            <button
                                                                key={
                                                                    agent.id
                                                                }
                                                                className={
                                                                    selected
                                                                        ? "sidebar-agent selected"
                                                                        : "sidebar-agent"
                                                                }
                                                                onClick={() =>
                                                                    toggleAgent(
                                                                        agent.id
                                                                    )
                                                                }
                                                            >

                                                                <span className="sidebar-agent-id">

                                                                    {
                                                                        agent.id.toUpperCase()
                                                                    }

                                                                </span>


                                                                <span className="sidebar-agent-name">

                                                                    {
                                                                        agent.name
                                                                    }

                                                                </span>


                                                                <span
                                                                    className={
                                                                        agent.online
                                                                            ? "sidebar-status online"
                                                                            : "sidebar-status offline"
                                                                    }
                                                                >

                                                                    ●

                                                                </span>


                                                                <span className="sidebar-cost">

                                                                    $
                                                                    {
                                                                        agent.cost
                                                                    }

                                                                </span>

                                                            </button>

                                                        );
                                                    }
                                                )}

                                            </div>

                                        )}

                                    </div>

                                );
                            }
                        )}

                    </div>

                )}

            </aside>
        );
    }


    // ========================================================
    // MAIN UI
    // ========================================================
	return (

		<div className="app">

			{/* ====================================================
				HEADER
				==================================================== */}

			<header className="header">

				YOUR EXISTING HEADER CONTENT

			</header>


			{/* ====================================================
				THREE-COLUMN WORKSPACE
				==================================================== */}

			<div className="workspace">

				{/* ================================================
					LEFT AGENT SIDEBAR
					================================================ */}

				<aside
					className={
						sidebarOpen
							? "sidebar"
							: "sidebar collapsed"
					}
				>

					YOUR EXISTING SIDEBAR CONTENT

				</aside>


				{/* ================================================
					CENTER AI CONTROL AREA
					================================================ */}

				<main className="main-content">

					YOUR EXISTING CENTER CONTENT

				</main>


				{/* ================================================
					RIGHT CONVERSATION PANE
					================================================ */}

				{renderConversationPane()}

			</div>

		</div>

	);
}


export default App;