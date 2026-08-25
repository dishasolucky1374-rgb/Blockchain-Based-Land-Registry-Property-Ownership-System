// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title LandRegistry
 * @author Student Project - Blockchain Course
 * @notice EDUCATIONAL PROTOTYPE ONLY.
 *
 * This contract simulates a land registry / property ownership system using
 * dummy, synthetic data and test wallets. It does NOT create legally valid
 * property ownership. Real-world land ownership requires integration with
 * government land authorities, cadastral/survey databases, identity
 * verification systems, and applicable property law. This contract is built
 * purely to demonstrate blockchain concepts: structs, mappings, access
 * control, events, and tamper-evident record keeping.
 */
contract LandRegistry {
    // ---------------------------------------------------------------------
    // ROLES
    // ---------------------------------------------------------------------

    /// @notice Address of the deploying "Land Authority" (admin).
    address public authority;

    /// @notice Optional additional verifiers appointed by the authority.
    mapping(address => bool) public isVerifier;

    // ---------------------------------------------------------------------
    // ENUM - PROPERTY STATUS
    // ---------------------------------------------------------------------

    enum Status {
        REGISTERED,       // 0 - just registered, not yet verified
        VERIFIED,         // 1 - authority/verifier confirmed the record
        TRANSFER_PENDING, // 2 - reserved for future multi-step transfer flow
        TRANSFERRED,       // 3 - ownership has changed at least once
        DISPUTED           // 4 - flagged by authority, transfers blocked
    }

    // ---------------------------------------------------------------------
    // STRUCT - PROPERTY DATA MODEL
    // ---------------------------------------------------------------------

    struct Property {
        uint256 propertyId;        // internal numeric ID (auto-incremented)
        string propertyNumber;     // human-readable ID, e.g. "P001" (dummy)
        string location;           // synthetic address / area name
        uint256 area;              // area in sq. ft. (or any unit, dummy data)
        string propertyType;       // e.g. "Residential", "Agricultural"
        address currentOwner;      // wallet address of current owner
        address previousOwner;     // wallet address of previous owner (if any)
        string documentHash;       // SHA-256 hash of an off-chain dummy document
        bool verified;             // true once authority/verifier approves
        Status status;             // current lifecycle status
        uint256 registeredAt;      // block timestamp of registration
        uint256 lastTransferredAt; // block timestamp of last transfer (0 if none)
        bool exists;               // used internally to check existence
    }

    // ---------------------------------------------------------------------
    // STORAGE
    // ---------------------------------------------------------------------

    /// @dev propertyId => Property record
    mapping(uint256 => Property) private properties;

    /// @dev owner address => list of property IDs they currently or previously held
    mapping(address => uint256[]) private ownerToProperties;

    /// @dev propertyNumber (human ID like "P001") => propertyId, prevents duplicates
    mapping(string => uint256) private propertyNumberToId;
    mapping(string => bool) private propertyNumberUsed;

    /// @dev auto-incrementing counter for internal propertyId
    uint256 private nextPropertyId = 1;

    /// @notice total number of properties ever registered
    uint256 public totalProperties;

    // ---------------------------------------------------------------------
    // EVENTS - PRESERVE OWNERSHIP / AUDIT HISTORY OFF-CHAIN VIA LOGS
    // ---------------------------------------------------------------------

    event PropertyRegistered(
        uint256 indexed propertyId,
        string propertyNumber,
        address indexed initialOwner,
        string documentHash,
        uint256 timestamp
    );

    event PropertyVerified(
        uint256 indexed propertyId,
        address indexed verifiedBy,
        uint256 timestamp
    );

    event OwnershipTransferred(
        uint256 indexed propertyId,
        address indexed previousOwner,
        address indexed newOwner,
        uint256 timestamp
    );

    event PropertyStatusUpdated(
        uint256 indexed propertyId,
        Status oldStatus,
        Status newStatus,
        uint256 timestamp
    );

    event VerifierAdded(address indexed verifier);
    event VerifierRemoved(address indexed verifier);

    // ---------------------------------------------------------------------
    // MODIFIERS
    // ---------------------------------------------------------------------

    modifier onlyAuthority() {
        require(msg.sender == authority, "LandRegistry: caller is not the authority");
        _;
    }

    modifier onlyAuthorityOrVerifier() {
        require(
            msg.sender == authority || isVerifier[msg.sender],
            "LandRegistry: caller is not authorized to verify"
        );
        _;
    }

    modifier propertyExists(uint256 _propertyId) {
        require(properties[_propertyId].exists, "LandRegistry: property does not exist");
        _;
    }

    modifier onlyPropertyOwner(uint256 _propertyId) {
        require(
            properties[_propertyId].currentOwner == msg.sender,
            "LandRegistry: caller is not the current owner"
        );
        _;
    }

    // ---------------------------------------------------------------------
    // CONSTRUCTOR
    // ---------------------------------------------------------------------

    constructor() {
        authority = msg.sender; // deployer becomes the Land Authority
    }

    // ---------------------------------------------------------------------
    // AUTHORITY / VERIFIER MANAGEMENT
    // ---------------------------------------------------------------------

    /// @notice Authority can appoint additional verifiers (e.g. sub-registrars).
    function addVerifier(address _verifier) external onlyAuthority {
        require(_verifier != address(0), "LandRegistry: zero address");
        isVerifier[_verifier] = true;
        emit VerifierAdded(_verifier);
    }

    function removeVerifier(address _verifier) external onlyAuthority {
        isVerifier[_verifier] = false;
        emit VerifierRemoved(_verifier);
    }

    // ---------------------------------------------------------------------
    // 1. PROPERTY REGISTRATION
    // ---------------------------------------------------------------------

    /**
     * @notice Registers a new dummy property on-chain.
     * @dev Only the authority can register properties. This models a
     *      government land office entering a new record into the system.
     * @param _propertyNumber Human-readable unique ID, e.g. "P001" (synthetic).
     * @param _location Synthetic location string (dummy data only).
     * @param _area Area value (dummy unit, must be > 0).
     * @param _propertyType e.g. "Residential", "Commercial", "Agricultural".
     * @param _initialOwner Wallet address of the property's initial owner.
     * @param _documentHash SHA-256 (or similar) hash of an off-chain dummy document.
     */
    function registerProperty(
        string memory _propertyNumber,
        string memory _location,
        uint256 _area,
        string memory _propertyType,
        address _initialOwner,
        string memory _documentHash
    ) external onlyAuthority returns (uint256) {
        // --- validations ---
        require(bytes(_propertyNumber).length > 0, "LandRegistry: propertyNumber required");
        require(!propertyNumberUsed[_propertyNumber], "LandRegistry: propertyNumber already used");
        require(bytes(_location).length > 0, "LandRegistry: location required");
        require(_area > 0, "LandRegistry: area must be greater than zero");
        require(_initialOwner != address(0), "LandRegistry: owner cannot be zero address");
        require(bytes(_documentHash).length > 0, "LandRegistry: document hash required");

        uint256 propertyId = nextPropertyId;
        nextPropertyId++;

        properties[propertyId] = Property({
            propertyId: propertyId,
            propertyNumber: _propertyNumber,
            location: _location,
            area: _area,
            propertyType: _propertyType,
            currentOwner: _initialOwner,
            previousOwner: address(0),
            documentHash: _documentHash,
            verified: false,
            status: Status.REGISTERED,
            registeredAt: block.timestamp,
            lastTransferredAt: 0,
            exists: true
        });

        propertyNumberToId[_propertyNumber] = propertyId;
        propertyNumberUsed[_propertyNumber] = true;

        ownerToProperties[_initialOwner].push(propertyId);
        totalProperties++;

        emit PropertyRegistered(propertyId, _propertyNumber, _initialOwner, _documentHash, block.timestamp);

        return propertyId;
    }

    // ---------------------------------------------------------------------
    // 2. PROPERTY VERIFICATION
    // ---------------------------------------------------------------------

    /**
     * @notice Marks a property as verified. Kept separate from registration
     *         because in real workflows a different official (surveyor /
     *         sub-registrar) typically confirms the record after it is filed.
     */
    function verifyProperty(uint256 _propertyId)
        external
        onlyAuthorityOrVerifier
        propertyExists(_propertyId)
    {
        Property storage p = properties[_propertyId];
        require(!p.verified, "LandRegistry: property already verified");
        require(p.status != Status.DISPUTED, "LandRegistry: disputed property cannot be verified");

        p.verified = true;
        Status old = p.status;
        p.status = Status.VERIFIED;

        emit PropertyVerified(_propertyId, msg.sender, block.timestamp);
        emit PropertyStatusUpdated(_propertyId, old, p.status, block.timestamp);
    }

    // ---------------------------------------------------------------------
    // 3. OWNERSHIP TRANSFER
    // ---------------------------------------------------------------------

    /**
     * @notice Transfers ownership of a verified property to a new owner.
     * @dev Only the current owner may call this. Property must be verified
     *      and must not be in DISPUTED status.
     */
    function transferOwnership(uint256 _propertyId, address _newOwner)
        external
        propertyExists(_propertyId)
        onlyPropertyOwner(_propertyId)
    {
        require(_newOwner != address(0), "LandRegistry: new owner cannot be zero address");

        Property storage p = properties[_propertyId];

        require(_newOwner != p.currentOwner, "LandRegistry: new owner is same as current owner");
        require(p.verified, "LandRegistry: property must be verified before transfer");
        require(p.status != Status.DISPUTED, "LandRegistry: disputed property cannot be transferred");

        address oldOwner = p.currentOwner;

        p.previousOwner = oldOwner;
        p.currentOwner = _newOwner;
        p.lastTransferredAt = block.timestamp;

        Status oldStatus = p.status;
        p.status = Status.TRANSFERRED;

        ownerToProperties[_newOwner].push(_propertyId);

        emit OwnershipTransferred(_propertyId, oldOwner, _newOwner, block.timestamp);
        emit PropertyStatusUpdated(_propertyId, oldStatus, p.status, block.timestamp);
    }

    // ---------------------------------------------------------------------
    // 4. ADMIN STATUS OVERRIDE (e.g. flag a property as DISPUTED)
    // ---------------------------------------------------------------------

    function updatePropertyStatus(uint256 _propertyId, Status _newStatus)
        external
        onlyAuthority
        propertyExists(_propertyId)
    {
        Property storage p = properties[_propertyId];
        Status old = p.status;
        p.status = _newStatus;
        emit PropertyStatusUpdated(_propertyId, old, _newStatus, block.timestamp);
    }

    // ---------------------------------------------------------------------
    // VIEW / READ FUNCTIONS
    // ---------------------------------------------------------------------

    function getProperty(uint256 _propertyId)
        external
        view
        propertyExists(_propertyId)
        returns (Property memory)
    {
        return properties[_propertyId];
    }

    function getPropertyIdByNumber(string memory _propertyNumber) external view returns (uint256) {
        require(propertyNumberUsed[_propertyNumber], "LandRegistry: unknown propertyNumber");
        return propertyNumberToId[_propertyNumber];
    }

    function getPropertiesByOwner(address _owner) external view returns (uint256[] memory) {
        return ownerToProperties[_owner];
    }

    function propertyExistsCheck(uint256 _propertyId) external view returns (bool) {
        return properties[_propertyId].exists;
    }

    function getCurrentOwner(uint256 _propertyId)
        external
        view
        propertyExists(_propertyId)
        returns (address)
    {
        return properties[_propertyId].currentOwner;
    }
}
