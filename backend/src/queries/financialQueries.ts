import User from "../models/User";
import FinancialPlan from "../models/FinancialPlan";
import Simulation from "../models/Simulation";
import SimulationResult from "../models/SimulationResult";

// Used by frontend to get list of plans by User
export const getPlansByUser = async (username: string) => {
	const user = await User.findOne({ username: username })
	return user?.plans;
}

// Get simulation from plan
export const getSimulation = async (planId : string) => {
	return Simulation.findOne({ planId: planId})
}

// Get simulation result by Id
export const getSimulationResultById = async (id: string) => {
	return SimulationResult.findById({ id })
}

// Get simulation result from Simulation Id
export const getSimulationResult = async (simulationId: string) => {
	return SimulationResult.findOne({ simulationId: simulationId })
}