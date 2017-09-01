CREATE PROCEDURE [dbo].[SecurityGroup_Create]
	@name nvarchar(30) = '',
	@security binary(32) = null,
	@datecreated datetime = null
AS

IF @datecreated = null SET @datecreated = GETDATE()

DECLARE @id int = NEXT VALUE FOR SequenceSecurityGroups
INSERT INTO SecurityGroups (groupId, [security], [name], datecreated) VALUES(@id, @security, @name, @datecreated)
